import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestChallenge } from './remoteChallengeClient';

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

describe('requestChallenge', () => {
  it('returns ok with challenge on success', async () => {
    mockFetch(200, {
      challengeId: 'uuid-1',
      message: 'Signal Vault remote sync challenge. id:uuid-1 ts:123',
      expiresAt: '2026-05-10T00:05:00Z',
    });
    const result = await requestChallenge('http://localhost:3000', '0xabc');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.challenge.challengeId).toBe('uuid-1');
      expect(result.challenge.message).toContain('uuid-1');
    }
  });

  it('returns ok=false on HTTP error response', async () => {
    mockFetch(500, { message: 'Internal Server Error' });
    const result = await requestChallenge('http://localhost:3000', '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('500');
  });

  it('returns ok=false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
    const result = await requestChallenge('http://localhost:3000', '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('Connection refused');
  });

  it('sends walletAddress in request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ challengeId: 'id', message: 'msg', expiresAt: 'ts' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await requestChallenge('http://localhost:3000', '0xspecific-wallet');
    const body = JSON.parse(((fetchMock.mock.calls[0] as unknown[])[1] as { body: string }).body) as Record<string, string>;
    expect(body['walletAddress']).toBe('0xspecific-wallet');
  });

  it('POSTs to /api/v1/auth/challenge', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ challengeId: 'id', message: 'msg', expiresAt: 'ts' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await requestChallenge('http://localhost:3000', '0xabc');
    const url = (fetchMock.mock.calls[0] as unknown[])[0] as string;
    expect(url).toBe('http://localhost:3000/api/v1/auth/challenge');
  });
});
