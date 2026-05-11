export type AuthFailureReason =
  | 'auth_missing'
  | 'wallet_signature_invalid'
  | 'wallet_signature_malformed'
  | 'character_token_invalid'
  | 'character_token_expired'
  | 'auth_mode_conflict'
  | 'identity_resolution_failed';

/** How the server derived character identity for this request. */
export type ServerIdentitySource =
  | 'sui_player_profile'
  | 'dev_character_jwt'
  | 'trusted_character_jwt';

export interface VerifiedAuth {
  walletAddress: string;
  characterId?: string;
  tribeId?: string;
  identitySource?: ServerIdentitySource;
}

export type AuthResult =
  | { ok: true; auth: VerifiedAuth }
  | { ok: false; reason: AuthFailureReason };
