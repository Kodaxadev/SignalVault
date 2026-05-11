export interface RemoteChallengeResult {
  challengeId: string;
  message: string;
  expiresAt: string;
}

export type RequestChallengeResult =
  | { ok: true; challenge: RemoteChallengeResult }
  | { ok: false; reason: string };

export async function requestChallenge(
  backendUrl: string,
  walletAddress: string
): Promise<RequestChallengeResult> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });

    if (!res.ok) {
      return { ok: false, reason: `Challenge request failed: HTTP ${res.status}` };
    }

    const body = await res.json() as RemoteChallengeResult;
    return { ok: true, challenge: body };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'Network error requesting challenge',
    };
  }
}
