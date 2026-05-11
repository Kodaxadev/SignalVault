export interface CharacterJwtClaims {
  sub: string;         // character ID — the authoritative server identity
  iss?: string;        // token issuer
  aud?: string;        // intended audience
  exp?: number;        // expiry (Unix timestamp)
  iat?: number;        // issued at
  tribe_id?: string;   // EVE Frontier tribe membership (issuer-supplied, not client)
}

export type JwtFailureReason =
  | 'character_token_invalid'
  | 'character_token_expired'
  | 'character_token_issuer_mismatch';

export type JwtVerifyResult =
  | { ok: true; claims: CharacterJwtClaims }
  | { ok: false; reason: JwtFailureReason };
