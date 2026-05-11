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
  it('returns a challenge with a unique id', () => {
    const c1 = createChallenge('0xabc');
    const c2 = createChallenge('0xabc');
    expect(c1.challengeId).not.toBe(c2.challengeId);
  });

  it('embeds the wallet address', () => {
    const c = createChallenge('0xabc');
    expect(c.walletAddress).toBe('0xabc');
  });

  it('embeds the challenge id in the message', () => {
    const c = createChallenge('0xabc');
    expect(c.message).toContain(c.challengeId);
  });

  it('sets expiresAt 5 minutes in the future', () => {
    const before = Date.now();
    const c = createChallenge('0xabc');
    const after = Date.now();
    const expectedMin = before + 5 * 60 * 1000;
    const expectedMax = after + 5 * 60 * 1000;
    expect(c.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(c.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});

describe('consumeChallenge', () => {
  it('returns ok for a valid challenge', () => {
    const c = createChallenge('0xabc');
    const result = consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(true);
  });

  it('returns not_found for unknown challengeId', () => {
    const result = consumeChallenge('no-such-id', '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_found');
  });

  it('returns already_used if consumed twice', () => {
    const c = createChallenge('0xabc');
    consumeChallenge(c.challengeId, '0xabc');
    const result = consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('already_used');
  });

  it('returns expired when challenge TTL has passed', () => {
    const c = createChallenge('0xabc');
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    const result = consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('expired');
  });

  it('returns wallet_mismatch when address does not match', () => {
    const c = createChallenge('0xabc');
    const result = consumeChallenge(c.challengeId, '0xdifferent');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_mismatch');
  });

  it('is case-insensitive for wallet address comparison', () => {
    const c = createChallenge('0xABC');
    const result = consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(true);
  });

  it('marks the challenge as used on success', () => {
    const c = createChallenge('0xabc');
    const result = consumeChallenge(c.challengeId, '0xabc');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.challenge.usedAt).toBeDefined();
  });
});
