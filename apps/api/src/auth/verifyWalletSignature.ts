import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { authEnv } from './authEnv';
import { MIN_SIGNATURE_LENGTH } from './walletSignatureTypes';
import type { WalletSignatureInput, WalletVerifyResult } from './walletSignatureTypes';

// Dev mode: structural validation only — checks format, not cryptographic proof.
// Returns the client-supplied address hint, or a deterministic stub derived from
// the signature prefix. Not suitable for any trust decision in production.
function verifyDev(input: WalletSignatureInput): WalletVerifyResult {
  if (!input.signature || input.signature.length < MIN_SIGNATURE_LENGTH) {
    return { ok: false, reason: 'wallet_signature_malformed' };
  }
  const derivedAddress = input.walletAddressHint ?? `dev:${input.signature.slice(0, 8)}`;
  return { ok: true, derivedAddress };
}

async function verifyProd(input: WalletSignatureInput): Promise<WalletVerifyResult> {
  if (!input.signature || !input.message) {
    return { ok: false, reason: 'wallet_signature_malformed' };
  }

  try {
    const messageBytes = new TextEncoder().encode(input.message);
    const publicKey = await verifyPersonalMessageSignature(messageBytes, input.signature, {
      address: input.walletAddressHint,
    });
    return { ok: true, derivedAddress: input.walletAddressHint ?? publicKey.toSuiAddress() };
  } catch {
    return { ok: false, reason: 'wallet_signature_invalid' };
  }
}

export async function verifyWalletSignature(
  input: WalletSignatureInput
): Promise<WalletVerifyResult> {
  if (authEnv.authDevMode) return verifyDev(input);
  return verifyProd(input);
}
