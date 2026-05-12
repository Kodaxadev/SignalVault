import { describe, it, expect, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import { verifyAuthFromHeaders } from '../src/auth/verifyAuth';
import { createChallenge, _clearChallengeStore } from '../src/auth/challengeStore';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';
import type { AuthInputs } from '../src/auth/resolveServerViewerContext';

// AUTH_DEV_MODE=true is set globally in vitest.config.ts

const TEST_SECRET = new TextEncoder().encode('test-secret-for-unit-tests-only');
const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);

async function makeJwt(claims: Record<string, unknown> = {}) {
  return new SignJWT({ sub: 'char-123', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

async function makeHeaders(claims: Record<string, unknown> = {}): Promise<AuthInputs> {
  const jwt = await makeJwt(claims);
  return {
    authorizationHeader: `Bearer ${jwt}`,
    walletSignature: VALID_SIG,
    signatureMessage: 'signal-vault:test-message',
  };
}

beforeEach(() => {
  _clearChallengeStore();
});

describe('verifyAuthFromHeaders', () => {
  it('returns auth_missing when both are absent', async () => {
    const result = await verifyAuthFromHeaders({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('auth_missing');
  });

  it('returns auth_missing when only authorization is present', async () => {
    const jwt = await makeJwt();
    const result = await verifyAuthFromHeaders({ authorizationHeader: `Bearer ${jwt}` });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('auth_missing');
  });

  it('proceeds without authorizationHeader when walletSignature is present (Sui-path compatible)', async () => {
    // In dev mode with Sui disabled: wallet sig alone → wallet_verified → character_token_invalid.
    // auth_missing must NOT be returned — the Sui path requires omitting the Bearer token.
    const result = await verifyAuthFromHeaders({
      walletSignature: VALID_SIG,
      signatureMessage: 'signal-vault:test',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('character_token_invalid');
  });

  it('returns wallet_signature_invalid when wallet signature is too short', async () => {
    const jwt = await makeJwt();
    const result = await verifyAuthFromHeaders({
      authorizationHeader: `Bearer ${jwt}`,
      walletSignature: 'short',
      signatureMessage: 'signal-vault:test',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_invalid');
  });

  it('returns character_token_invalid when JWT is malformed', async () => {
    const result = await verifyAuthFromHeaders({
      authorizationHeader: 'Bearer not-a-valid-jwt',
      walletSignature: VALID_SIG,
      signatureMessage: 'signal-vault:test',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('character_token_invalid');
  });

  it('returns ok when headers are fully valid', async () => {
    const result = await verifyAuthFromHeaders(await makeHeaders());
    expect(result.ok).toBe(true);
  });

  it('derived walletAddress starts with dev: in dev mode without hint', async () => {
    const result = await verifyAuthFromHeaders(await makeHeaders());
    if (!result.ok) throw new Error('expected ok');
    expect(result.auth.walletAddress).toMatch(/^dev:/);
  });

  it('uses X-Wallet-Address as address hint in dev mode', async () => {
    const headers = await makeHeaders();
    const result = await verifyAuthFromHeaders({ ...headers, walletAddressHint: 'hint-wallet' });
    if (!result.ok) throw new Error('expected ok');
    expect(result.auth.walletAddress).toBe('hint-wallet');
  });

  it('characterId is populated from JWT sub claim', async () => {
    const result = await verifyAuthFromHeaders(await makeHeaders({ sub: 'char-specific-id' }));
    if (!result.ok) throw new Error('expected ok');
    expect(result.auth.characterId).toBe('char-specific-id');
  });

  it('tribeId is populated from JWT tribe_id claim', async () => {
    const result = await verifyAuthFromHeaders(await makeHeaders({ tribe_id: 'tribe-abc' }));
    if (!result.ok) throw new Error('expected ok');
    expect(result.auth.tribeId).toBe('tribe-abc');
  });

  it('tribeId is undefined when tribe_id absent from JWT', async () => {
    const result = await verifyAuthFromHeaders(await makeHeaders());
    if (!result.ok) throw new Error('expected ok');
    expect(result.auth.tribeId).toBeUndefined();
  });
});

describe('verifyAuthFromHeaders — challenge path', () => {
  it('succeeds with valid challenge + matching wallet + valid JWT', async () => {
    const challenge = await createChallenge('0xwallet-1');
    const jwt = await makeJwt({ sub: 'char-1' });
    const result = await verifyAuthFromHeaders({
      authorizationHeader: `Bearer ${jwt}`,
      walletSignature: VALID_SIG,
      walletAddressHint: '0xwallet-1',
      challengeId: challenge.challengeId,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.auth.walletAddress).toBe('0xwallet-1');
  });

  it('returns wallet_signature_invalid for unknown challengeId', async () => {
    const jwt = await makeJwt();
    const result = await verifyAuthFromHeaders({
      authorizationHeader: `Bearer ${jwt}`,
      walletSignature: VALID_SIG,
      walletAddressHint: '0xwallet-1',
      challengeId: 'no-such-challenge',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_invalid');
  });

  it('returns wallet_signature_invalid when challenge is reused', async () => {
    const challenge = await createChallenge('0xwallet-1');
    const jwt = await makeJwt();
    const inputs: AuthInputs = {
      authorizationHeader: `Bearer ${jwt}`,
      walletSignature: VALID_SIG,
      walletAddressHint: '0xwallet-1',
      challengeId: challenge.challengeId,
    };
    await verifyAuthFromHeaders(inputs);
    const second = await verifyAuthFromHeaders(inputs);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe('wallet_signature_invalid');
  });

  it('returns wallet_signature_invalid when wallet address does not match challenge', async () => {
    const challenge = await createChallenge('0xcorrect-wallet');
    const jwt = await makeJwt();
    const result = await verifyAuthFromHeaders({
      authorizationHeader: `Bearer ${jwt}`,
      walletSignature: VALID_SIG,
      walletAddressHint: '0xwrong-wallet',
      challengeId: challenge.challengeId,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_invalid');
  });

  it('returns wallet_signature_invalid when walletAddressHint is missing with challengeId', async () => {
    const challenge = await createChallenge('0xwallet-1');
    const jwt = await makeJwt();
    const result = await verifyAuthFromHeaders({
      authorizationHeader: `Bearer ${jwt}`,
      walletSignature: VALID_SIG,
      challengeId: challenge.challengeId,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_invalid');
  });
});
