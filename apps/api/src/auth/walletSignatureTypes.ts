export interface WalletSignatureInput {
  signature: string;       // hex- or base64-encoded signature bytes
  message: string;         // the exact message that was signed
  walletAddressHint?: string; // client-supplied address hint — NOT authoritative
}

export type WalletFailureReason =
  | 'wallet_signature_invalid'
  | 'wallet_signature_malformed';

export type WalletVerifyResult =
  | { ok: true; derivedAddress: string }
  | { ok: false; reason: WalletFailureReason };

// Minimum encoded signature length accepted by structural validation.
// Real Sui signatures are ~88 chars base64. Set conservatively for dev.
export const MIN_SIGNATURE_LENGTH = 20;
