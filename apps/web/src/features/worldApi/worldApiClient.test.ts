import { describe, it, expect, vi, afterEach } from 'vitest';
import { worldApiGet } from './worldApiClient';
import { WorldApiError } from './worldApiErrors';

// Mock the base URL to avoid real network calls
vi.mock('./worldApiConfig', () => ({
  getWorldApiBaseUrl: () => 'https://world-api-utopia.uat.pub.evefrontier.com',
}));

describe('worldApiClient', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('returns loaded data on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'test' }),
    });

    const result = await worldApiGet<{ id: number; name: string }>('/v2/test/1');
    expect(result.status).toBe('loaded');
    expect(result.status === 'loaded' && result.data.id).toBe(1);
  });

  it('returns unavailable on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await worldApiGet('/v2/test/999');
    expect(result.status).toBe('unavailable');
    expect(result.status === 'unavailable' && result.error).toBeInstanceOf(WorldApiError);
  });

  it('returns unavailable on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failed'));

    const result = await worldApiGet('/v2/test/1');
    expect(result.status).toBe('unavailable');
    expect(result.status === 'unavailable' && result.reason).toBe('Network failed');
  });

  it('returns unavailable on timeout', async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn().mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new DOMException('aborted', 'AbortError')), 100)),
    );

    const promise = worldApiGet('/v2/test/1', { timeoutMs: 50 });
    vi.advanceTimersByTime(100);

    const result = await promise;
    expect(result.status).toBe('unavailable');
    expect(result.status === 'unavailable' && result.reason).toBe('timeout');
  });
});
