// Character token contract constants and identity mode utilities.
// See docs/backend/16-character-token-contract.md
// See docs/backend/18-production-identity-mode.md

import { suiEnv } from '../character/suiEnv';

// ── JWT token path (still blocked) ───────────────────────────────────────────

export const CHARACTER_TOKEN_CONTRACT_STATUS = 'blocked_pending_trusted_issuer' as const;

export const REQUIRED_CHARACTER_TOKEN_CLAIMS = [
  'sub', // EVE Frontier character ID — authoritative server identity
  'iss', // Token issuer URL — must match server allowlist
  'aud', // Intended audience — must match server expected audience
  'exp', // Expiry timestamp — server rejects expired tokens
  'iat', // Issued at
] as const;

export const CHARACTER_TOKEN_HARD_INVARIANTS = [
  'No background or automatic sync until production-grade character token issuance exists.',
  'The server never trusts character identity from the request body or headers — only from a verified source.',
  'AUTH_DEV_MODE=true must never be set in production.',
  'VITE_REMOTE_DEV_CHARACTER_JWT is local scaffolding only — not a production auth mechanism.',
  'tribe_id used for tribe-scoped visibility must come from the verified identity source, never from the client.',
] as const;

/** The CCP-issued JWT path remains blocked. Sui PlayerProfile resolution is the active production path. */
export function isProductionCharacterTokenAvailable(): false {
  return false;
}

// ── Sui PlayerProfile resolution path (proven, available) ────────────────────

/**
 * Production identity modes.
 *
 * - 'none'                  No character identity available.
 * - 'dev_character_jwt'     Developer-supplied JWT decoded without sig verification (AUTH_DEV_MODE only).
 * - 'sui_player_profile'    Character resolved server-side from on-chain Sui PlayerProfile + Character.
 * - 'trusted_character_jwt' CCP-issued JWT with verified signature (JWKS) — not yet available.
 */
export type ProductionIdentityMode =
  | 'none'
  | 'dev_character_jwt'
  | 'sui_player_profile'
  | 'trusted_character_jwt';

/** Returns true when ENABLE_SUI_CHARACTER_RESOLUTION=true and a GraphQL URL is configured. */
export function isSuiPlayerProfileResolutionAvailable(): boolean {
  return suiEnv.enableSuiCharacterResolution && Boolean(suiEnv.suiGraphqlUrl);
}

/** Returns the active production identity mode based on current environment configuration. */
export function getProductionIdentityMode(): ProductionIdentityMode {
  if (isSuiPlayerProfileResolutionAvailable()) return 'sui_player_profile';
  if (process.env['AUTH_DEV_MODE'] === 'true') return 'dev_character_jwt';
  return 'none';
}
