export interface Challenge {
  challengeId: string;
  walletAddress: string;
  message: string;
  expiresAt: Date;
  usedAt?: Date;
}

export interface ChallengeRequest {
  walletAddress: string;
}

export interface ChallengeResponse {
  challengeId: string;
  message: string;
  expiresAt: string;
}

export type ChallengeConsumeResult =
  | { ok: true; challenge: Challenge }
  | { ok: false; reason: 'not_found' | 'already_used' | 'expired' | 'wallet_mismatch' };
