import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';

// Production mode: AUTH_DEV_MODE=false, Sui enabled.
// All vi.mock calls are hoisted — order in file does not matter.

vi.mock('../src/auth/authEnv', () => ({
  authEnv: { authDevMode: false },
}));

vi.mock('../src/character/suiEnv', () => ({
  suiEnv: { enableSuiCharacterResolution: true, suiGraphqlUrl: 'https://mock-sui' },
}));

vi.mock('../src/character/resolveCharacterFromSui', () => ({
  resolveCharacterFromSui: vi.fn(),
}));

// In production mode, verifyWalletSignature fails closed by default.
// Mock it to return a known address so tests focus on the context guard logic,
// not on the (separately tested) wallet verification path.
vi.mock('../src/auth/verifyWalletSignature', () => ({
  verifyWalletSignature: vi.fn(),
}));

import { resolveServerViewerContext } from '../src/auth/resolveServerViewerContext';
import { resolveCharacterFromSui } from '../src/character/resolveCharacterFromSui';
import { verifyWalletSignature } from '../src/auth/verifyWalletSignature';

const mockVerifyWallet = vi.mocked(verifyWalletSignature);

const mockSuiResolve = vi.mocked(resolveCharacterFromSui);

const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);
const VALID_MSG = 'signal-vault:test';
const WALLET = '0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f';

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
  // Default: wallet verification succeeds with the test wallet address.
  mockVerifyWallet.mockResolvedValue({ ok: true, derivedAddress: WALLET });
});

describe('resolveServerViewerContext — production Sui mode (AUTH_DEV_MODE=false)', () => {
  it('returns character_resolved with identitySource sui_player_profile on Sui success', async () => {
    mockSuiResolve.mockResolvedValue(SUI_SUCCESS);

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
    });

    expect(ctx.kind).toBe('character_resolved');
    if (ctx.kind === 'character_resolved') {
      expect(ctx.characterId).toBe('2112089652');
      expect(ctx.tribeId).toBe('1000167');
      expect(ctx.identitySource).toBe('sui_player_profile');
    }
  });

  it('returns identity_resolution_failed when Sui fails (no JWT fallback in prod)', async () => {
    mockSuiResolve.mockResolvedValue({ ok: false, reason: 'no_player_profile' as const });

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
    });

    expect(ctx.kind).toBe('identity_resolution_failed');
    if (ctx.kind === 'identity_resolution_failed') {
      expect(ctx.suiReason).toBe('no_player_profile');
      expect(ctx.walletAddress).toBe(WALLET);
    }
  });

  it('returns auth_mode_conflict when JWT header is present in production Sui mode', async () => {
    // Sui would succeed, but JWT presence is rejected before Sui is called
    mockSuiResolve.mockResolvedValue(SUI_SUCCESS);

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
      authorizationHeader: 'Bearer some.dev.token',
    });

    expect(ctx.kind).toBe('auth_mode_conflict');
    if (ctx.kind === 'auth_mode_conflict') {
      expect(ctx.reason).toContain('Sui character resolution is enabled in production mode');
    }
  });

  it('does not call Sui resolver when auth_mode_conflict is triggered', async () => {
    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
      authorizationHeader: 'Bearer some.dev.token',
    });

    expect(ctx.kind).toBe('auth_mode_conflict');
    expect(mockSuiResolve).not.toHaveBeenCalled();
  });

  it('returns auth_mode_conflict even when Sui would fail — JWT presence is the trigger', async () => {
    mockSuiResolve.mockResolvedValue({ ok: false, reason: 'no_player_profile' as const });

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
      authorizationHeader: 'Bearer some.dev.token',
    });

    expect(ctx.kind).toBe('auth_mode_conflict');
    expect(mockSuiResolve).not.toHaveBeenCalled();
  });

  it('returns anonymous when wallet signature fails — Sui is never called', async () => {
    mockVerifyWallet.mockResolvedValue({ ok: false, reason: 'wallet_signature_malformed' as const });

    const ctx = await resolveServerViewerContext({
      walletSignature: 'short',
      signatureMessage: VALID_MSG,
    });

    expect(ctx.kind).toBe('anonymous');
    expect(mockSuiResolve).not.toHaveBeenCalled();
  });

  it('identity_resolution_failed carries the suiReason string', async () => {
    mockSuiResolve.mockResolvedValue({
      ok: false,
      reason: 'wallet_address_mismatch' as const,
    });

    const ctx = await resolveServerViewerContext({
      walletSignature: VALID_SIG,
      signatureMessage: VALID_MSG,
      walletAddressHint: WALLET,
    });

    expect(ctx.kind).toBe('identity_resolution_failed');
    if (ctx.kind === 'identity_resolution_failed') {
      expect(ctx.suiReason).toBe('wallet_address_mismatch');
    }
  });
});
