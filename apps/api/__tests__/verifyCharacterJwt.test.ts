import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import { verifyCharacterJwt } from '../src/auth/verifyCharacterJwt';

// AUTH_DEV_MODE=true is set globally in vitest.config.ts
const TEST_SECRET = new TextEncoder().encode('test-secret-for-unit-tests-only');

async function makeJwt(claims: Record<string, unknown> = {}, expiresIn = '1h') {
  return new SignJWT({ sub: 'char-test-123', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(TEST_SECRET);
}

describe('verifyCharacterJwt (dev mode)', () => {
  it('returns ok for a valid JWT with sub claim', async () => {
    const token = await makeJwt();
    const result = await verifyCharacterJwt(token);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claims.sub).toBe('char-test-123');
  });

  it('extracts tribe_id from claims when present', async () => {
    const token = await makeJwt({ tribe_id: 'tribe-abc' });
    const result = await verifyCharacterJwt(token);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claims.tribe_id).toBe('tribe-abc');
  });

  it('tribe_id is undefined when absent from claims', async () => {
    const token = await makeJwt();
    const result = await verifyCharacterJwt(token);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claims.tribe_id).toBeUndefined();
  });

  it('returns character_token_invalid for empty string', async () => {
    const result = await verifyCharacterJwt('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('character_token_invalid');
  });

  it('returns character_token_invalid for non-JWT string', async () => {
    const result = await verifyCharacterJwt('not-a-jwt-at-all');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('character_token_invalid');
  });

  it('returns character_token_invalid for JWT without sub', async () => {
    // Make a JWT with no sub claim
    const token = await new SignJWT({ role: 'guest' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(TEST_SECRET);
    const result = await verifyCharacterJwt(token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('character_token_invalid');
  });

  it('decodes without verifying signature in dev mode (wrong secret still decodes)', async () => {
    const wrongSecret = new TextEncoder().encode('completely-different-secret');
    const token = await new SignJWT({ sub: 'char-from-wrong-secret' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(wrongSecret);
    // In dev mode, signature is not checked — decodes successfully
    const result = await verifyCharacterJwt(token);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.claims.sub).toBe('char-from-wrong-secret');
  });
});
