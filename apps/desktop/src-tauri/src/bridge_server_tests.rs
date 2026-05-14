use super::{route_request, HttpRequest};
use crate::{bridge_commands::BridgeCommandQueue, bridge_state::BridgeStateStore};

const VALID_STATE: &str = r#"{
  "app":"signal-vault",
  "schemaVersion":1,
  "generatedAt":"2026-05-12T12:00:00.000Z",
  "warnings":[],
  "latestSignals":[]
}"#;

#[test]
fn get_state_is_unavailable_until_state_is_published() {
    let response = route("GET", "/state", "", false, None);

    assert_eq!(response.status_code, 503);
}

#[test]
fn post_state_stores_latest_state_for_get() {
    let store = BridgeStateStore::default();
    let queue = BridgeCommandQueue::default();

    let post_response = route_request(
        &request("POST", "/state", VALID_STATE, true, Some("paired-token")),
        &store,
        &queue,
        "paired-token",
    );
    let get_response = route_request(
        &request("GET", "/state", "", false, None),
        &store,
        &queue,
        "paired-token",
    );

    assert_eq!(post_response.status_code, 204);
    assert_eq!(get_response.status_code, 200);
    assert_eq!(get_response.body, VALID_STATE);
}

#[test]
fn malformed_post_does_not_replace_previous_state() {
    let store = BridgeStateStore::default();
    let queue = BridgeCommandQueue::default();

    let _ = route_request(
        &request("POST", "/state", VALID_STATE, true, Some("paired-token")),
        &store,
        &queue,
        "paired-token",
    );
    let bad_response = route_request(
        &request(
            "POST",
            "/state",
            r#"{"app":"other"}"#,
            true,
            Some("paired-token"),
        ),
        &store,
        &queue,
        "paired-token",
    );

    assert_eq!(bad_response.status_code, 400);
    assert_eq!(store.latest_state(), Some(VALID_STATE.to_string()));
}

#[test]
fn post_state_requires_json_content_type_and_pairing_token() {
    assert_eq!(
        route("POST", "/state", VALID_STATE, false, None).status_code,
        415
    );
    assert_eq!(
        route("POST", "/state", VALID_STATE, true, None).status_code,
        401
    );
}

#[test]
fn pending_commands_require_pairing_token() {
    assert_eq!(
        route("GET", "/commands/pending", "", false, None).status_code,
        401
    );
}

#[test]
fn pending_commands_return_queued_quick_notes() {
    let store = BridgeStateStore::default();
    let queue = BridgeCommandQueue::default();
    let _ = queue.queue_quick_note(crate::bridge_commands::QuickNoteDraft {
        body: "Hostile contact at node".to_string(),
        created_at: Some("2026-05-13T12:00:00.000Z".to_string()),
        current_system_name: Some("OQQ-0R8".to_string()),
    });

    let response = route_request(
        &request("GET", "/commands/pending", "", false, Some("paired-token")),
        &store,
        &queue,
        "paired-token",
    );

    assert_eq!(response.status_code, 200);
    assert!(response.body.contains(r#""type":"quick_note""#));
    assert!(response.body.contains("Hostile contact at node"));
}

#[test]
fn ack_command_requires_token_and_removes_pending_command() {
    let store = BridgeStateStore::default();
    let queue = BridgeCommandQueue::default();
    let command = queue
        .queue_quick_note(crate::bridge_commands::QuickNoteDraft {
            body: "Hostile contact at node".to_string(),
            created_at: Some("2026-05-13T12:00:00.000Z".to_string()),
            current_system_name: None,
        })
        .expect("command should queue");
    let path = format!("/commands/{}/ack", command.id);

    assert_eq!(
        route_request(
            &request("POST", &path, "", false, None),
            &store,
            &queue,
            "paired-token"
        )
        .status_code,
        401
    );
    assert_eq!(
        route_request(
            &request("POST", &path, "", false, Some("paired-token")),
            &store,
            &queue,
            "paired-token",
        )
        .status_code,
        204
    );
    assert!(queue.pending_commands().is_empty());
}

fn route(
    method: &str,
    path: &str,
    body: &str,
    json: bool,
    token: Option<&str>,
) -> super::HttpResponse {
    let store = BridgeStateStore::default();
    let queue = BridgeCommandQueue::default();
    route_request(
        &request(method, path, body, json, token),
        &store,
        &queue,
        "paired-token",
    )
}

fn request(method: &str, path: &str, body: &str, json: bool, token: Option<&str>) -> HttpRequest {
    let mut headers = if json {
        vec!["Content-Type: application/json".to_string()]
    } else {
        Vec::new()
    };
    if let Some(token) = token {
        headers.push(format!("X-Signal-Vault-Bridge-Token: {token}"));
    }

    HttpRequest {
        method: method.to_string(),
        path: path.to_string(),
        headers,
        body: body.to_string(),
    }
}
