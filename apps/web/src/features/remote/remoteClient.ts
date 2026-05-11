export interface RemoteClientConfig {
  backendUrl: string;
}

export interface RemoteRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function remoteGet<T>(
  config: RemoteClientConfig,
  path: string,
  options: RemoteRequestOptions = {}
): Promise<T> {
  const res = await fetch(`${config.backendUrl}${path}`, {
    method: 'GET',
    headers: { 'content-type': 'application/json', ...options.headers },
    signal: options.signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(String(body['message'] ?? `HTTP ${res.status}`));
  }
  return res.json() as Promise<T>;
}

export async function remotePost<T>(
  config: RemoteClientConfig,
  path: string,
  body: unknown,
  options: RemoteRequestOptions = {}
): Promise<T> {
  const res = await fetch(`${config.backendUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    signal: options.signal,
  });
  if (!res.ok) {
    const resBody = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(String(resBody['message'] ?? `HTTP ${res.status}`));
  }
  return res.json() as Promise<T>;
}
