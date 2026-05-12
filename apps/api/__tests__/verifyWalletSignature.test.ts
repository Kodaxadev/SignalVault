import { describe, it, expect, vi } from 'vitest';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { verifyWalletSignature } from '../src/auth/verifyWalletSignature';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';

// AUTH_DEV_MODE=true is set globally in vitest.config.ts

const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);
const BASE_INPUT = { signature: VALID_SIG, message: 'signal-vault:test' };

describe('verifyWalletSignature (dev mode)', () => {
  it('returns ok for a signature that meets minimum length', async () => {
    const result = await verifyWalletSignature(BASE_INPUT);
    expect(result.ok).toBe(true);
  });

  it('derives address from walletAddressHint when provided', async () => {
    const result = await verifyWalletSignature({
      ...BASE_INPUT,
      walletAddressHint: '0xabc123',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.derivedAddress).toBe('0xabc123');
  });

  it('derives stub address from signature prefix when no hint provided', async () => {
    const result = await verifyWalletSignature(BASE_INPUT);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.derivedAddress).toMatch(/^dev:/);
  });

  it('returns wallet_signature_malformed for empty signature', async () => {
    const result = await verifyWalletSignature({ signature: '', message: 'msg' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_malformed');
  });

  it('returns wallet_signature_malformed when below minimum length', async () => {
    const short = 'x'.repeat(MIN_SIGNATURE_LENGTH - 1);
    const result = await verifyWalletSignature({ signature: short, message: 'msg' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_malformed');
  });

  it('accepts signature exactly at minimum length', async () => {
    const exact = 'x'.repeat(MIN_SIGNATURE_LENGTH);
    const result = await verifyWalletSignature({ signature: exact, message: 'msg' });
    expect(result.ok).toBe(true);
  });

  it('stub derivedAddress uses first 8 chars of signature', async () => {
    const sig = 'abcdefghijklmnopqrstuvwxyz';
    const result = await verifyWalletSignature({ signature: sig, message: 'msg' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.derivedAddress).toBe('dev:abcdefgh');
  });
});

describe('verifyWalletSignature (production mode)', () => {
  it('accepts a valid Sui personal-message signature for the expected address', async () => {
    vi.resetModules();
    vi.doMock('../src/auth/authEnv', () => ({
      authEnv: { authDevMode: false },
    }));

    const { verifyWalletSignature } = await import('../src/auth/verifyWalletSignature');
    const keypair = new Ed25519Keypair();
    const message = 'signal-vault:prod-challenge';
    const { signature } = await keypair.signPersonalMessage(new TextEncoder().encode(message));

    const result = await verifyWalletSignature({
      signature,
      message,
      walletAddressHint: keypair.toSuiAddress(),
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.derivedAddress).toBe(keypair.toSuiAddress());
  });

  it('rejects a valid signature when the expected address does not match', async () => {
    vi.resetModules();
    vi.doMock('../src/auth/authEnv', () => ({
      authEnv: { authDevMode: false },
    }));

    const { verifyWalletSignature } = await import('../src/auth/verifyWalletSignature');
    const signer = new Ed25519Keypair();
    const other = new Ed25519Keypair();
    const message = 'signal-vault:prod-challenge';
    const { signature } = await signer.signPersonalMessage(new TextEncoder().encode(message));

    const result = await verifyWalletSignature({
      signature,
      message,
      walletAddressHint: other.toSuiAddress(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wallet_signature_invalid');
  });
});
