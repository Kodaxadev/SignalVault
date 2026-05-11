import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkBackendHealth } from './remoteBackendHealth';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }));
}

function mockFetchThrows(error: Error) {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
}

describe('checkBackendHealth', () => {
  it('returns reachable=true and writesEnabled=true when backend reports enabled', async () => {
    mockFetch(200, { status: 'ok', writesEnabled: true });
    const result = await checkBackendHealth('http://localhost:3000');
    expect(result.reachable).toBe(true);
    expect(result.writesEnabled).toBe(true);
  });

  it('returns reachable=true and writesEnabled=false when backend reports disabled', async () => {
    mockFetch(200, { status: 'ok', writesEnabled: false });
    const result = await checkBackendHealth('http://localhost:3000');
    expect(result.reachable).toBe(true);
    expect(result.writesEnabled).toBe(false);
  });

  it('returns reachable=false when backend returns non-200', async () => {
    mockFetch(503, {});
    const result = await checkBackendHealth('http://localhost:3000');
    expect(result.reachable).toBe(false);
    expect(result.writesEnabled).toBe(false);
  });

  it('returns reachable=false when fetch throws (network error)', async () => {
    mockFetchThrows(new Error('network error'));
    const result = await checkBackendHealth('http://localhost:3000');
    expect(result.reachable).toBe(false);
    expect(result.writesEnabled).toBe(false);
  });

  it('treats writesEnabled=false when field is absent from response', async () => {
    mockFetch(200, { status: 'ok' });
    const result = await checkBackendHealth('http://localhost:3000');
    expect(result.reachable).toBe(true);
    expect(result.writesEnabled).toBe(false);
  });
});
