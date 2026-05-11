// Builds auth headers for challenge-based remote push (Phase 09I+).
//
// Key difference from buildRemoteAuthHeaders (dev path):
//   - Sends X-Challenge-Id instead of X-Signature-Message.
//   - Server retrieves the signed message from its challenge store.
//   - characterJwt is still dev/stubbed in 09I — real character token issuance
//     is deferred to a future phase.
export interface SignedAuthInput {
  challengeId: string;
  signature: string;
  walletAddress: string;
  // Character JWT — still dev/stubbed in 09I. Must be explicitly provided;
  // this function does not read env vars directly.
  characterJwt: string;
}

export function buildSignedAuthHeaders(input: SignedAuthInput): Record<string, string> {
  return {
    Authorization: `Bearer ${input.characterJwt}`,
    'X-Wallet-Address': input.walletAddress,
    'X-Wallet-Signature': input.signature,
    'X-Challenge-Id': input.challengeId,
  };
}
