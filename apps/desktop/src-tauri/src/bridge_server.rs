use crate::{
    bridge_commands::BridgeCommandQueue,
    bridge_state::{BridgeStateError, BridgeStateStore},
};
use std::{
    io::{self, Read, Write},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};

pub const BRIDGE_BIND_ADDRESS: &str = "127.0.0.1:17777";

pub fn spawn_bridge_server(
    store: BridgeStateStore,
    command_queue: BridgeCommandQueue,
    pairing_token: String,
) -> io::Result<thread::JoinHandle<()>> {
    let listener = TcpListener::bind(BRIDGE_BIND_ADDRESS)?;
    let handle = thread::spawn(move || {
        for stream in listener.incoming() {
            match stream {
                Ok(stream) => {
                    handle_connection(stream, store.clone(), command_queue.clone(), &pairing_token)
                }
                Err(error) => eprintln!("[bridge] connection failed: {error}"),
            }
        }
    });

    Ok(handle)
}

fn handle_connection(
    mut stream: TcpStream,
    store: BridgeStateStore,
    command_queue: BridgeCommandQueue,
    pairing_token: &str,
) {
    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let request = match read_request(&mut stream) {
        Ok(request) => request,
        Err(error) => {
            let _ = write_response(&mut stream, 400, "Bad Request", error.as_bytes());
            return;
        }
    };

    let response = route_request(&request, &store, &command_queue, pairing_token);
    let _ = write_response(
        &mut stream,
        response.status_code,
        response.reason,
        response.body.as_bytes(),
    );
}

fn route_request(
    request: &HttpRequest,
    store: &BridgeStateStore,
    command_queue: &BridgeCommandQueue,
    pairing_token: &str,
) -> HttpResponse {
    if request.path == "/state" {
        return route_state_request(request, store, pairing_token);
    }

    if request.path == "/commands/pending" {
        return route_pending_commands(request, command_queue, pairing_token);
    }

    if let Some(command_id) = command_ack_id(&request.path) {
        return route_command_ack(request, command_queue, pairing_token, command_id);
    }

    HttpResponse::new(404, "Not Found", "")
}

fn route_state_request(
    request: &HttpRequest,
    store: &BridgeStateStore,
    pairing_token: &str,
) -> HttpResponse {
    match request.method.as_str() {
        "OPTIONS" => HttpResponse::new(204, "No Content", ""),
        "GET" => match store.latest_state() {
            Some(state) => HttpResponse::new(200, "OK", state),
            None => HttpResponse::new(503, "Service Unavailable", ""),
        },
        "POST" => {
            if !request.has_json_content_type() {
                return HttpResponse::new(415, "Unsupported Media Type", "");
            }
            if !request.has_pairing_token(pairing_token) {
                return HttpResponse::new(401, "Unauthorized", "");
            }

            match store.accept_state(&request.body) {
                Ok(()) => HttpResponse::new(204, "No Content", ""),
                Err(error) => bridge_error_response(error),
            }
        }
        _ => HttpResponse::new(405, "Method Not Allowed", ""),
    }
}

fn route_pending_commands(
    request: &HttpRequest,
    command_queue: &BridgeCommandQueue,
    pairing_token: &str,
) -> HttpResponse {
    match request.method.as_str() {
        "OPTIONS" => HttpResponse::new(204, "No Content", ""),
        "GET" => {
            if !request.has_pairing_token(pairing_token) {
                return HttpResponse::new(401, "Unauthorized", "");
            }

            match command_queue.pending_json() {
                Ok(body) => HttpResponse::new(200, "OK", body),
                Err(_) => HttpResponse::new(503, "Service Unavailable", ""),
            }
        }
        _ => HttpResponse::new(405, "Method Not Allowed", ""),
    }
}

fn route_command_ack(
    request: &HttpRequest,
    command_queue: &BridgeCommandQueue,
    pairing_token: &str,
    command_id: &str,
) -> HttpResponse {
    match request.method.as_str() {
        "OPTIONS" => HttpResponse::new(204, "No Content", ""),
        "POST" => {
            if !request.has_pairing_token(pairing_token) {
                return HttpResponse::new(401, "Unauthorized", "");
            }

            if command_queue.ack_command(command_id) {
                HttpResponse::new(204, "No Content", "")
            } else {
                HttpResponse::new(404, "Not Found", "")
            }
        }
        _ => HttpResponse::new(405, "Method Not Allowed", ""),
    }
}

fn command_ack_id(path: &str) -> Option<&str> {
    let suffix = path.strip_prefix("/commands/")?;
    suffix.strip_suffix("/ack").filter(|id| !id.is_empty())
}

fn bridge_error_response(error: BridgeStateError) -> HttpResponse {
    let body = format!(r#"{{"error":"{:?}"}}"#, error);
    HttpResponse::new(400, "Bad Request", body)
}

fn read_request(stream: &mut TcpStream) -> Result<HttpRequest, &'static str> {
    let mut buffer = Vec::new();
    let mut chunk = [0_u8; 4096];

    loop {
        let read = stream.read(&mut chunk).map_err(|_| "read_failed")?;
        if read == 0 {
            break;
        }

        buffer.extend_from_slice(&chunk[..read]);
        if request_body_complete(&buffer) {
            break;
        }
    }

    parse_request(&buffer)
}

fn request_body_complete(buffer: &[u8]) -> bool {
    let Some(header_end) = find_header_end(buffer) else {
        return false;
    };
    let headers = String::from_utf8_lossy(&buffer[..header_end]);
    let content_length = headers
        .lines()
        .find_map(|line| {
            let (name, value) = line.split_once(':')?;
            name.eq_ignore_ascii_case("content-length")
                .then_some(value.trim())
        })
        .and_then(|value| value.trim().parse::<usize>().ok())
        .unwrap_or(0);

    buffer.len() >= header_end + 4 + content_length
}

fn parse_request(buffer: &[u8]) -> Result<HttpRequest, &'static str> {
    let header_end = find_header_end(buffer).ok_or("missing_headers")?;
    let header_text = std::str::from_utf8(&buffer[..header_end]).map_err(|_| "invalid_utf8")?;
    let mut lines = header_text.lines();
    let request_line = lines.next().ok_or("missing_request_line")?;
    let mut request_parts = request_line.split_whitespace();
    let method = request_parts.next().ok_or("missing_method")?.to_string();
    let path = request_parts.next().ok_or("missing_path")?.to_string();
    let headers = lines.map(str::to_string).collect::<Vec<_>>();
    let body = String::from_utf8_lossy(&buffer[header_end + 4..]).to_string();

    Ok(HttpRequest {
        method,
        path,
        headers,
        body,
    })
}

fn find_header_end(buffer: &[u8]) -> Option<usize> {
    buffer.windows(4).position(|window| window == b"\r\n\r\n")
}

fn write_response(
    stream: &mut TcpStream,
    status_code: u16,
    reason: &str,
    body: &[u8],
) -> io::Result<()> {
    write!(
        stream,
        "HTTP/1.1 {status_code} {reason}\r\n\
         Access-Control-Allow-Origin: *\r\n\
         Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n\
         Access-Control-Allow-Headers: content-type, x-signal-vault-bridge-token\r\n\
         Content-Type: application/json\r\n\
         Content-Length: {}\r\n\
         Connection: close\r\n\r\n",
        body.len()
    )?;
    stream.write_all(body)
}

struct HttpRequest {
    method: String,
    path: String,
    headers: Vec<String>,
    body: String,
}

impl HttpRequest {
    fn has_json_content_type(&self) -> bool {
        self.headers.iter().any(|header| {
            header
                .to_ascii_lowercase()
                .starts_with("content-type: application/json")
        })
    }

    fn has_pairing_token(&self, expected_token: &str) -> bool {
        self.headers.iter().any(|header| {
            let Some((name, value)) = header.split_once(':') else {
                return false;
            };

            name.eq_ignore_ascii_case("x-signal-vault-bridge-token")
                && value.trim() == expected_token
        })
    }
}

struct HttpResponse {
    status_code: u16,
    reason: &'static str,
    body: String,
}

impl HttpResponse {
    fn new(status_code: u16, reason: &'static str, body: impl Into<String>) -> Self {
        Self {
            status_code,
            reason,
            body: body.into(),
        }
    }
}

#[cfg(test)]
#[path = "bridge_server_tests.rs"]
mod bridge_server_tests;
