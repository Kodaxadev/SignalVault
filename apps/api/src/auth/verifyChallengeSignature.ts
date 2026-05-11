import { verifyWalletSignature } from './verifyWalletSignature';

export type ChallengeSignatureResult =
  | { ok: true; verifiedAddress: string }
  | { ok: false; reason: 'signature_malformed' | 'signature_invalid' };

// Verifies that a wallet signed a specific challenge message.
//
// In dev mode (AUTH_DEV_MODE=true): structural check only — any sufficiently long
// signature is accepted. The client-supplied address hint is returned as the
// verified address. Not suitable for any trust decision in production.
//
// In production mode: cryptographic recovery is deferred pending EVE Frontier
// dApp Kit signature scheme confirmation (Sui Ed25519 or secp256k1).
// See verifyWalletSignature.ts for the full implementation plan.
export async function verifyChallengeSignature(
  challengeMessage: string,
  signature: string,
  walletAddressHint: string
): Promise<ChallengeSignatureResult> {
  const result = await verifyWalletSignature({
    signature,
    message: challengeMessage,
    walletAddressHint,
  });

  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason === 'wallet_signature_malformed'
        ? 'signature_malformed'
        : 'signature_invalid',
    };
  }

  return { ok: true, verifiedAddress: result.derivedAddress };
}
