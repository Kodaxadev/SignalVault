// Contract types for character token issuance.
// Status: BLOCKED — no trusted EVE Frontier issuer exists yet.
// See docs/backend/16-character-token-contract.md

export type CharacterTokenStatus =
  | 'available'
  | 'blocked_pending_trusted_issuer'
  | 'missing'
  | 'expired'
  | 'invalid';

// Claims the server requires from a verified character token.
// These reflect server-side requirements — never trust client-supplied values.
export interface CharacterTokenClaims {
  sub: string;          // EVE Frontier character ID
  iss: string;          // Token issuer URL
  aud: string;          // Intended audience
  exp: number;          // Expiry (Unix timestamp)
  iat: number;          // Issued at
  tribe_id?: string;    // Tribe membership (issuer-supplied)
}

export type CharacterTokenResult =
  | { status: 'available'; claims: CharacterTokenClaims; rawToken: string }
  | { status: 'blocked_pending_trusted_issuer' }
  | { status: 'missing' }
  | { status: 'expired' }
  | { status: 'invalid'; reason: string };

// Interface a real character token issuer must satisfy.
// No implementation exists yet — this is the contract only.
export interface CharacterTokenIssuer {
  getToken(): Promise<CharacterTokenResult>;
  invalidate(): void;
}
