import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import { resolveServerViewerContext } from '../src/auth/resolveServerViewerContext';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';

// AUTH_DEV_MODE=true is set globally in vitest.config.ts.
// ENABLE_SUI_CHARACTER_RESOLUTION is NOT set — Sui path is skipped in this file.
// Sui-path tests live in resolveServerViewerContextSui.test.ts.

const TEST_SECRET = new TextEncoder().encode('test-secret-for-unit-tests-only');
const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);
const VALID_MSG = 'signal-vault:test';

async function makeJwt(claims: Record<string, unknown> = {}) {
  return new SignJWT({ sub: 'char-123', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

describe('resolveServerViewerContext', () => {
  it('returns anonymous when no inputs provided', async () => {
    const ctx = await resolveServerViewerContext({});
    expect(ctx.kind).toBe('anonymous');
  });

  it('returns anonymous when wallet sig fails', async () => {
    const ctx = await resolveServerViewerContext({
      walletSignature: 'short',
      signatureMessage: VALID_MSG,
    });
    expect(ctx.kind).toBe('anonymous');
  });

  it('returns wallet_verified when wallet ok but no JWT', async () => {
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
    });
    expect(ctx.kind).toBe('wallet_verified');
    if (ctx.kind === 'wallet_verified') {
      expect(typeof ctx.walletAddress).toBe('string');
    }
  });

  it('returns wallet_verified when wallet ok but JWT is invalid', async () => {
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      authorizationHeader: 'Bearer not-a-jwt',
    });
    expect(ctx.kind).toBe('wallet_verified');
  });

  it('returns character_resolved when both wallet and JWT pass', async () => {
    const token = await makeJwt();
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      authorizationHeader: `Bearer ${token}`,
    });
    expect(ctx.kind).toBe('character_resolved');
    if (ctx.kind === 'character_resolved') {
      expect(ctx.characterId).toBe('char-123');
      expect(typeof ctx.walletAddress).toBe('string');
    }
  });

  it('propagates tribe_id from JWT into character_resolved context', async () => {
    const token = await makeJwt({ tribe_id: 'tribe-xyz' });
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      authorizationHeader: `Bearer ${token}`,
    });
    expect(ctx.kind).toBe('character_resolved');
    if (ctx.kind === 'character_resolved') {
      expect(ctx.tribeId).toBe('tribe-xyz');
    }
  });

  it('uses walletAddressHint as derivedAddress in dev mode', async () => {
    const token = await makeJwt();
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      authorizationHeader: `Bearer ${token}`,
      walletAddressHint: '0xdeadbeef',
    });
    if (ctx.kind === 'character_resolved') {
      expect(ctx.walletAddress).toBe('0xdeadbeef');
    }
  });

  it('returns anonymous when neither wallet nor JWT provided', async () => {
    const ctx = await resolveServerViewerContext({ authorizationHeader: undefined });
    expect(ctx.kind).toBe('anonymous');
  });
});
