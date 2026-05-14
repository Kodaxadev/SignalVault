import type { Challenge, ChallengeConsumeResult } from './challengeTypes';
import { insertChallengeToDb, consumeChallengeFromDb } from '../db/challengeRepository';

// Challenge TTL: 5 minutes. Short window reduces replay risk.
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const store = new Map<string, Challenge>();

export async function createChallenge(walletAddress: string): Promise<Challenge> {
  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  const message = [
    'Signal Vault remote sync challenge.',
    `id:${challengeId}`,
    `ts:${expiresAt.getTime()}`,
  ].join(' ');

  const challenge: Challenge = { challengeId, walletAddress, message, expiresAt };
  store.set(challengeId, challenge);
  try {
    await insertChallengeToDb(challenge);
  } catch {
    // Keep local fallback available; auth will fail closed if neither store can consume.
  }
  return challenge;
}

export async function consumeChallenge(
  challengeId: string,
  walletAddress: string
): Promise<ChallengeConsumeResult> {
  try {
    const persisted = await consumeChallengeFromDb(challengeId, walletAddress);
    if (persisted) {
      if (persisted.ok) {
        store.set(challengeId, { ...persisted.challenge, usedAt: new Date() });
      }
      return persisted;
    }
  } catch {
    // Fall through to in-memory store.
  }

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
