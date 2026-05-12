import { verifyCharacterJwt } from './verifyCharacterJwt';
import { verifyWalletSignature } from './verifyWalletSignature';
import { resolveCharacterFromSui } from '../character/resolveCharacterFromSui';
import { suiEnv } from '../character/suiEnv';
import { authEnv } from './authEnv';
import type { ServerIdentitySource } from './authTypes';

export type { ServerIdentitySource };

export type ServerViewerKind =
  | 'anonymous'
  | 'wallet_verified'
  | 'character_resolved'
  | 'auth_mode_conflict'
  | 'identity_resolution_failed';

export type ServerViewerContext =
  | { kind: 'anonymous' }
  | { kind: 'wallet_verified'; walletAddress: string }
  | {
      kind: 'character_resolved';
      walletAddress: string;
      characterId: string;
      characterName?: string;
      tribeId?: string;
      identitySource: ServerIdentitySource;
      identityResolvedAt: string;
    }
  | { kind: 'auth_mode_conflict'; reason: string }
  | { kind: 'identity_resolution_failed'; walletAddress: string; suiReason: string };

// Auth inputs extracted from the request. walletAddressHint is client-supplied
// and is NOT authoritative — the real address is derived from the signature.
export interface AuthInputs {
  /** Bearer token carrying the character JWT */
  authorizationHeader?: string;
  /** Wallet signature bytes (hex or base64) */
  walletSignature?: string;
  /** The exact message the wallet signed (dev/static path) */
  signatureMessage?: string;
  /** Client-supplied wallet address — used only as a fallback hint in dev mode */
  walletAddressHint?: string;
  /** Challenge ID for challenge-based auth (09I+) */
  challengeId?: string;
}

export async function resolveServerViewerContext(
  inputs: AuthInputs
): Promise<ServerViewerContext> {
  const { authorizationHeader, walletSignature, signatureMessage, walletAddressHint } = inputs;

  let walletAddress: string | undefined;

  // ── Step 1: verify wallet signature → authoritative wallet address ────────
  if (walletSignature && signatureMessage) {
    const walletResult = await verifyWalletSignature({
      signature: walletSignature,
      message: signatureMessage,
      walletAddressHint,
    });
    if (walletResult.ok) {
      walletAddress = walletResult.derivedAddress;
    }
  }

  if (!walletAddress) {
    return { kind: 'anonymous' };
  }

  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : undefined;

  // Production Sui mode: AUTH_DEV_MODE=false + ENABLE_SUI_CHARACTER_RESOLUTION=true
  const isProductionSuiMode = suiEnv.enableSuiCharacterResolution && !authEnv.authDevMode;

  // ── Step 2: Production guard — reject dev JWT presence immediately ────────
  // Surfacing misconfiguration early is preferred over silently ignoring the header.
  if (isProductionSuiMode && token) {
    return {
      kind: 'auth_mode_conflict',
      reason: 'Dev character JWT is not accepted when Sui character resolution is enabled in production mode',
    };
  }

  // ── Step 3: Sui PlayerProfile resolution (preferred production identity) ──
  // Enabled by ENABLE_SUI_CHARACTER_RESOLUTION=true. In dev mode, Sui failure
  // falls through to the JWT path. In production mode, Sui failure is terminal.
  if (suiEnv.enableSuiCharacterResolution) {
    const suiResult = await resolveCharacterFromSui(walletAddress);
    if (suiResult.ok) {
      return {
        kind: 'character_resolved',
        walletAddress,
        characterId: suiResult.character.characterItemId,
        characterName: suiResult.character.characterName,
        tribeId: String(suiResult.character.tribeId),
        identitySource: 'sui_player_profile',
        identityResolvedAt: new Date().toISOString(),
      };
    }
    if (isProductionSuiMode) {
      return { kind: 'identity_resolution_failed', walletAddress, suiReason: suiResult.reason };
    }
    // Dev mode: Sui failed — fall through to JWT with a logged warning
    console.warn('[auth] Sui resolution failed in dev mode, falling back to dev JWT:', suiResult.reason);
  }

  // ── Step 4: character JWT path (dev auth / fallback) ─────────────────────
  if (token) {
    const jwtResult = await verifyCharacterJwt(token);
    if (jwtResult.ok) {
      return {
        kind: 'character_resolved',
        walletAddress,
        characterId: jwtResult.claims.sub,
        tribeId: jwtResult.claims.tribe_id,
        identitySource: 'dev_character_jwt',
        identityResolvedAt: new Date().toISOString(),
      };
    }
  }

  // Wallet verified but no character identity resolved
  return { kind: 'wallet_verified', walletAddress };
}
