export interface BackendHealthResult {
  reachable: boolean;
  writesEnabled: boolean;
}

export async function checkBackendHealth(backendUrl: string): Promise<BackendHealthResult> {
  try {
    const res = await fetch(`${backendUrl}/health`, { method: 'GET' });
    if (!res.ok) return { reachable: false, writesEnabled: false };
    const body = await res.json() as Record<string, unknown>;
    return {
      reachable: true,
      writesEnabled: body['writesEnabled'] === true,
    };
  } catch {
    return { reachable: false, writesEnabled: false };
  }
}
