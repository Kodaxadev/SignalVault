import { describe, it, expect, vi, afterEach } from 'vitest';
import { signRemoteChallenge } from './remoteWalletSigning';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockChallengeEndpoint(ok: boolean, body: unknown = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  }));
}

describe('signRemoteChallenge', () => {
  it('returns ok with challengeId and signature on success', async () => {
    mockChallengeEndpoint(true, {
      challengeId: 'uuid-1',
      message: 'Signal Vault challenge msg',
      expiresAt: '2026-05-10T00:05:00Z',
    });
    const signMessage = vi.fn().mockResolvedValue('wallet-sig-result');

    const result = await signRemoteChallenge('http://localhost:3000', '0xabc', signMessage);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.challengeId).toBe('uuid-1');
      expect(result.signature).toBe('wallet-sig-result');
      expect(result.walletAddress).toBe('0xabc');
    }
  });

  it('passes challenge message to signMessage', async () => {
    mockChallengeEndpoint(true, {
      challengeId: 'uuid-1',
      message: 'specific challenge message',
      expiresAt: '2026-05-10T00:05:00Z',
    });
    const signMessage = vi.fn().mockResolvedValue('sig');

    await signRemoteChallenge('http://localhost:3000', '0xabc', signMessage);
    expect(signMessage).toHaveBeenCalledWith('specific challenge message');
  });

  it('returns ok=false when challenge request fails', async () => {
    mockChallengeEndpoint(false);
    const signMessage = vi.fn();

    const result = await signRemoteChallenge('http://localhost:3000', '0xabc', signMessage);
    expect(result.ok).toBe(false);
    expect(signMessage).not.toHaveBeenCalled();
  });

  it('returns ok=false when signMessage throws', async () => {
    mockChallengeEndpoint(true, {
      challengeId: 'uuid-1',
      message: 'msg',
      expiresAt: '2026-05-10T00:05:00Z',
    });
    const signMessage = vi.fn().mockRejectedValue(new Error('User rejected signing'));

    const result = await signRemoteChallenge('http://localhost:3000', '0xabc', signMessage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('User rejected signing');
  });

  it('returns ok=false on network error fetching challenge', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
    const signMessage = vi.fn();

    const result = await signRemoteChallenge('http://localhost:3000', '0xabc', signMessage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('Network down');
  });
});
