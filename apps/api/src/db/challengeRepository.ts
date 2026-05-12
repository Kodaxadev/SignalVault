import type { Challenge, ChallengeConsumeResult } from '../auth/challengeTypes';
import { getPool } from './dbClient';

const INSERT_CHALLENGE_SQL = `
  INSERT INTO auth_challenges (
    challenge_id, wallet_address, message, expires_at
  ) VALUES ($1, $2, $3, $4)
`;

const SELECT_CHALLENGE_SQL = `
  SELECT challenge_id, wallet_address, message, expires_at, used_at
  FROM auth_challenges
  WHERE challenge_id = $1
`;

const MARK_USED_SQL = `
  UPDATE auth_challenges
  SET used_at = now()
  WHERE challenge_id = $1
    AND used_at IS NULL
    AND expires_at > now()
    AND lower(wallet_address) = lower($2)
  RETURNING challenge_id, wallet_address, message, expires_at, used_at
`;

interface ChallengeRow {
  challenge_id: string;
  wallet_address: string;
  message: string;
  expires_at: Date | string;
  used_at: Date | string | null;
}

function rowToChallenge(row: ChallengeRow): Challenge {
  return {
    challengeId: row.challenge_id,
    walletAddress: row.wallet_address,
    message: row.message,
    expiresAt: new Date(row.expires_at),
    usedAt: row.used_at ? new Date(row.used_at) : undefined,
  };
}

export async function insertChallengeToDb(challenge: Challenge): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;
  await pool.query(INSERT_CHALLENGE_SQL, [
    challenge.challengeId,
    challenge.walletAddress,
    challenge.message,
    challenge.expiresAt.toISOString(),
  ]);
  return true;
}

export async function consumeChallengeFromDb(
  challengeId: string,
  walletAddress: string
): Promise<ChallengeConsumeResult | null> {
  const pool = getPool();
  if (!pool) return null;

  const updated = await pool.query<ChallengeRow>(MARK_USED_SQL, [challengeId, walletAddress]);
  const row = updated.rows[0];
  if (row) return { ok: true, challenge: rowToChallenge(row) };

  const existing = await pool.query<ChallengeRow>(SELECT_CHALLENGE_SQL, [challengeId]);
  const found = existing.rows[0];
  if (!found) return { ok: false, reason: 'not_found' };
  if (found.used_at) return { ok: false, reason: 'already_used' };
  if (Date.now() > new Date(found.expires_at).getTime()) {
    return { ok: false, reason: 'expired' };
  }
  if (found.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
    return { ok: false, reason: 'wallet_mismatch' };
  }
  return { ok: false, reason: 'not_found' };
}
