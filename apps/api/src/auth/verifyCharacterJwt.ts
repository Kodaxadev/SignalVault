import { decodeJwt, jwtVerify, createRemoteJWKSet, errors } from 'jose';
import { authEnv } from './authEnv';
import type { CharacterJwtClaims, JwtVerifyResult } from './jwtTypes';

function extractClaims(payload: Record<string, unknown>): CharacterJwtClaims | null {
  if (typeof payload['sub'] !== 'string' || !payload['sub']) return null;
  return {
    sub: payload['sub'],
    iss: typeof payload['iss'] === 'string' ? payload['iss'] : undefined,
    aud: typeof payload['aud'] === 'string' ? payload['aud'] : undefined,
    exp: typeof payload['exp'] === 'number' ? payload['exp'] : undefined,
    iat: typeof payload['iat'] === 'number' ? payload['iat'] : undefined,
    tribe_id: typeof payload['tribe_id'] === 'string' ? payload['tribe_id'] : undefined,
  };
}

// Dev mode: decodes without signature verification.
// WARNING: AUTH_DEV_MODE must never be enabled in production.
async function verifyDev(token: string): Promise<JwtVerifyResult> {
  try {
    const payload = decodeJwt(token);
    const claims = extractClaims(payload as Record<string, unknown>);
    if (!claims) return { ok: false, reason: 'character_token_invalid' };
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: 'character_token_invalid' };
  }
}

// Production mode: verifies signature against JWKS endpoint or HS256 secret.
async function verifyProd(token: string): Promise<JwtVerifyResult> {
  if (!authEnv.jwtSecret && !authEnv.jwtJwksUrl) {
    // No verification key configured — fail closed
    return { ok: false, reason: 'character_token_invalid' };
  }

  const options = {
    issuer: authEnv.jwtIssuer,
    audience: authEnv.jwtAudience,
  };

  try {
    let payload: Record<string, unknown>;

    if (authEnv.jwtSecret) {
      const secret = new TextEncoder().encode(authEnv.jwtSecret);
      const result = await jwtVerify(token, secret, options);
      payload = result.payload as Record<string, unknown>;
    } else {
      const JWKS = createRemoteJWKSet(new URL(authEnv.jwtJwksUrl!));
      const result = await jwtVerify(token, JWKS, options);
      payload = result.payload as Record<string, unknown>;
    }

    const claims = extractClaims(payload);
    if (!claims) return { ok: false, reason: 'character_token_invalid' };
    return { ok: true, claims };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      return { ok: false, reason: 'character_token_expired' };
    }
    if (err instanceof errors.JWTClaimValidationFailed) {
      return { ok: false, reason: 'character_token_issuer_mismatch' };
    }
    return { ok: false, reason: 'character_token_invalid' };
  }
}

export async function verifyCharacterJwt(token: string): Promise<JwtVerifyResult> {
  if (!token) return { ok: false, reason: 'character_token_invalid' };
  if (authEnv.authDevMode) return verifyDev(token);
  return verifyProd(token);
}
