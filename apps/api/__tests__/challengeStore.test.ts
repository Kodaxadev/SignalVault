import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createChallenge, consumeChallenge, _clearChallengeStore } from '../src/auth/challengeStore';

beforeEach(() => {
  _clearChallengeStore();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createChallenge', () => {
  it('returns a challenge with a unique id', async () => {
    const c1 = await createChallenge('0xabc');
    const c2 = await createChallenge('0xabc');
    expect(c1.challengeId).not.toBe(c2.challengeId);
  });

  it('embeds the wallet address', async () => {
    const c = await createChallenge('0xabc');
    expect(c.walletAddress).toBe('0xabc');
  });

  it('embeds the challenge id in the message', async () => {
    const c = await createChallenge('0xabc');
    expect(c.message).toContain(c.challengeId);
  });

  it('sets expiresAt 5 minutes in the future', async () => {
    const before = Date.now();
    const c = await createChallenge('0xabc');
    const after = Date.now();
    const expectedMin = before + 5 * 60 * 1000;
    const expectedMax = after + 5 * 60 * 1000;
    expect(c.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(c.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});

describe('consumeChallenge', () => {
  it('returns ok for a valid challenge', async () => {
    const c = await createChallenge('0xabc');
    const result = await consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(true);
  });

  it('returns not_found for unknown challengeId', async () => {
    const result = await consumeChallenge('no-such-id', '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_found');
  });

  it('returns already_used if consumed twice', async () => {
    const c = await createChallenge('0xabc');
    await consumeChallenge(c.challengeId, '0xabc');
    const result = await consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('already_used');
  });

  it('returns expired when challenge TTL has passed', async () => {
    const c = await createChallenge('0xabc');
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    const result = await consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('expired');
  });

  it('returns wallet_mismatch when address does not match', async () => {
    const c = await createChallenge('0xabc');
    const result = await consumeChallenge(c.challengeId, '0xdifferent');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_mismatch');
  });

  it('is case-insensitive for wallet address comparison', async () => {
    const c = await createChallenge('0xABC');
    const result = await consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(true);
  });

  it('marks the challenge as used on success', async () => {
    const c = await createChallenge('0xabc');
    const result = await consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.challenge.usedAt).toBeDefined();
  });
});
