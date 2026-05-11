import { requestChallenge } from './remoteChallengeClient';

export type WalletSigningResult =
  | {
      ok: true;
      challengeId: string;
      signature: string;
      walletAddress: string;
    }
  | { ok: false; reason: string };

// Orchestrates the challenge/sign flow for a single push:
//   1. Request a one-time challenge from the backend.
//   2. Ask the wallet to sign the challenge message.
//   3. Return the signed result for header construction.
//
// Signing only happens after the user initiates a push — never automatically.
// The signMessage callback is provided by useWalletSigningAdapter (InGame only).
export async function signRemoteChallenge(
  backendUrl: string,
  walletAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<WalletSigningResult> {
  const challengeResult = await requestChallenge(backendUrl, walletAddress);
  if (!challengeResult.ok) {
    return { ok: false, reason: challengeResult.reason };
  }

  try {
    const signature = await signMessage(challengeResult.challenge.message);
    return {
      ok: true,
      challengeId: challengeResult.challenge.challengeId,
      signature,
      walletAddress,
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'Wallet signing rejected or failed',
    };
  }
}
