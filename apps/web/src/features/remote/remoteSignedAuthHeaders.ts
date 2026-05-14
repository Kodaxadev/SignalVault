// Builds auth headers for challenge-based remote push (Phase 09I+).
//
// Key difference from buildRemoteAuthHeaders (dev path):
//   - Sends X-Challenge-Id instead of X-Signature-Message.
//   - Server retrieves the signed message from its challenge store.
export interface SignedAuthInput {
  challengeId: string;
  signature: string;
  walletAddress: string;
}

export function buildSignedAuthHeaders(input: SignedAuthInput): Record<string, string> {
  return {
    'X-Wallet-Address': input.walletAddress,
    'X-Wallet-Signature': input.signature,
    'X-Challenge-Id': input.challengeId,
  };
}
