import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';

// Mock suiEnv BEFORE importing resolveServerViewerContext so the module
// sees enableSuiCharacterResolution=true when it is first evaluated.
vi.mock('../src/character/suiEnv', () => ({
  suiEnv: { enableSuiCharacterResolution: true, suiGraphqlUrl: 'https://mock-sui' },
}));

vi.mock('../src/character/resolveCharacterFromSui', () => ({
  resolveCharacterFromSui: vi.fn(),
}));

import { resolveServerViewerContext } from '../src/auth/resolveServerViewerContext';
import { resolveCharacterFromSui } from '../src/character/resolveCharacterFromSui';

const mockSuiResolve = vi.mocked(resolveCharacterFromSui);

const TEST_SECRET = new TextEncoder().encode('test-secret-for-unit-tests-only');
const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);
const VALID_MSG = 'signal-vault:test';
const WALLET = '0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f';

async function makeJwt(claims: Record<string, unknown> = {}) {
  return new SignJWT({ sub: 'char-123', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

const SUI_SUCCESS = {
  ok: true as const,
  profile: {
    objectAddress: '0xprofile',
    characterObjectId: '0xcharacter',
    packageId: '0x28b4',
  },
  character: {
    characterObjectId: '0xcharacter',
    characterItemId: '2112089652',
    characterName: 'Kivik',
    tribeId: 1000167,
    characterAddress: WALLET,
    tenant: 'stillness',
  },
};

beforeEach(() => {
  mockSuiResolve.mockReset();
});

describe('resolveServerViewerContext — Sui identity path', () => {
  it('returns character_resolved from Sui when resolution succeeds', async () => {
    mockSuiResolve.mockResolvedValue(SUI_SUCCESS);

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
    });

    expect(ctx.kind).toBe('character_resolved');
    if (ctx.kind === 'character_resolved') {
      expect(ctx.characterId).toBe('2112089652');
      expect(ctx.characterName).toBe('Kivik');
      expect(ctx.tribeId).toBe('1000167');
      expect(ctx.identitySource).toBe('sui_player_profile');
      expect(new Date(ctx.identityResolvedAt).toISOString()).toBe(ctx.identityResolvedAt);
    }
  });

  it('tribeId from Sui is coerced to string', async () => {
    mockSuiResolve.mockResolvedValue(SUI_SUCCESS);

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
    });

    if (ctx.kind === 'character_resolved') {
      expect(typeof ctx.tribeId).toBe('string');
      expect(ctx.tribeId).toBe('1000167');
    }
  });

  it('characterId from Sui is Character.key.item_id, not the Sui object address', async () => {
    mockSuiResolve.mockResolvedValue(SUI_SUCCESS);

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
    });

    if (ctx.kind === 'character_resolved') {
      expect(ctx.characterId).toBe('2112089652');
      expect(ctx.characterId).not.toBe('0xcharacter');
    }
  });

  it('falls back to JWT when Sui resolution fails (dev mode)', async () => {
    mockSuiResolve.mockResolvedValue({ ok: false, reason: 'no_player_profile' as const });

    const token = await makeJwt();
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      authorizationHeader: `Bearer ${token}`,
    });

    expect(ctx.kind).toBe('character_resolved');
    if (ctx.kind === 'character_resolved') {
      expect(ctx.characterId).toBe('char-123');
      expect(ctx.identitySource).toBe('dev_character_jwt');
    }
  });

  it('returns wallet_verified when Sui fails and no JWT provided', async () => {
    mockSuiResolve.mockResolvedValue({ ok: false, reason: 'no_player_profile' as const });

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
    });

    expect(ctx.kind).toBe('wallet_verified');
  });

  it('returns anonymous when wallet sig fails — Sui is never called', async () => {
    const ctx = await resolveServerViewerContext({
      walletSignature: 'short',
      signatureMessage: VALID_MSG,
    });
    expect(ctx.kind).toBe('anonymous');
    expect(mockSuiResolve).not.toHaveBeenCalled();
  });

  it('Sui resolution is called with the verified wallet address', async () => {
    mockSuiResolve.mockResolvedValue(SUI_SUCCESS);

    await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
    });

    expect(mockSuiResolve).toHaveBeenCalledOnce();
    expect(mockSuiResolve).toHaveBeenCalledWith(WALLET);
  });
});
