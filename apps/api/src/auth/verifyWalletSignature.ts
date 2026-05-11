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

// Production mode: cryptographic recovery is required but not yet implemented.
//
// Full implementation requires:
//   1. Determine signature scheme from EVE Frontier dApp Kit (Sui Ed25519 or secp256k1).
//   2. Parse the Sui signature envelope: flag byte + signature bytes + public key bytes.
//   3. Recover/verify the public key against the signature and message.
//   4. Derive the Sui address from the public key.
//   5. Library: @mysten/sui verifyPersonalMessage(message, signatureBytes) or
//      @noble/ed25519 / @noble/curves for lower-level verification.
//
// Until EVE dApp Kit signature format is confirmed, production mode fails closed.
async function verifyProd(_input: WalletSignatureInput): Promise<WalletVerifyResult> {
  return { ok: false, reason: 'wallet_signature_invalid' };
}

export async function verifyWalletSignature(
  input: WalletSignatureInput
): Promise<WalletVerifyResult> {
  if (authEnv.authDevMode) return verifyDev(input);
  return verifyProd(input);
}
