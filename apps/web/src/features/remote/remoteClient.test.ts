import { describe, it, expect, vi, afterEach } from 'vitest';
import { remoteGet, remotePost } from './remoteClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }));
}

describe('remoteGet', () => {
  it('returns parsed body on 200', async () => {
    mockFetch(200, { signals: [] });
    const result = await remoteGet<{ signals: unknown[] }>(
      { backendUrl: 'http://localhost:3000' },
      '/api/v1/signals'
    );
    expect(result.signals).toEqual([]);
  });

  it('throws on non-200 response', async () => {
    mockFetch(404, { message: 'Not found' });
    await expect(
      remoteGet({ backendUrl: 'http://localhost:3000' }, '/api/v1/signals/missing')
    ).rejects.toThrow('Not found');
  });

  it('includes custom headers in request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);
    await remoteGet(
      { backendUrl: 'http://localhost:3000' },
      '/health',
      { headers: { 'x-custom': 'val' } }
    );
    const callHeaders = ((fetchMock.mock.calls[0] as unknown[])[1]) as { headers: Record<string, string> };
    expect(callHeaders.headers['x-custom']).toBe('val');
  });
});

describe('remotePost', () => {
  it('returns parsed body on 201', async () => {
    mockFetch(201, { signalId: 'uuid-1' });
    const result = await remotePost<{ signalId: string }>(
      { backendUrl: 'http://localhost:3000' },
      '/api/v1/signals',
      { signal: {} }
    );
    expect(result.signalId).toBe('uuid-1');
  });

  it('throws on 401 response', async () => {
    mockFetch(401, { message: 'Authentication failed' });
    await expect(
      remotePost({ backendUrl: 'http://localhost:3000' }, '/api/v1/signals', {})
    ).rejects.toThrow('Authentication failed');
  });
});
