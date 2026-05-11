import type { Challenge, ChallengeConsumeResult } from './challengeTypes';

// Challenge TTL: 5 minutes. Short window reduces replay risk.
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const store = new Map<string, Challenge>();

export function createChallenge(walletAddress: string): Challenge {
  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  const message = [
    'Signal Vault remote sync challenge.',
    `id:${challengeId}`,
    `ts:${expiresAt.getTime()}`,
  ].join(' ');

  const challenge: Challenge = { challengeId, walletAddress, message, expiresAt };
  store.set(challengeId, challenge);
  return challenge;
}

export function consumeChallenge(
  challengeId: string,
  walletAddress: string
): ChallengeConsumeResult {
  const challenge = store.get(challengeId);
  if (!challenge) return { ok: false, reason: 'not_found' };
  if (challenge.usedAt) return { ok: false, reason: 'already_used' };
  if (Date.now() > challenge.expiresAt.getTime()) {
    store.delete(challengeId);
    return { ok: false, reason: 'expired' };
  }
  if (challenge.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return { ok: false, reason: 'wallet_mismatch' };
  }
  challenge.usedAt = new Date();
  return { ok: true, challenge };
}

// Exposed for tests only — clears all stored challenges.
export function _clearChallengeStore(): void {
  store.clear();
}
