import { resolveServerViewerContext } from './resolveServerViewerContext';
import type { AuthInputs } from './resolveServerViewerContext';
import type { AuthResult } from './authTypes';
import { consumeChallenge } from './challengeStore';
import { verifyChallengeSignature } from './verifyChallengeSignature';

export async function verifyAuthFromHeaders(inputs: AuthInputs): Promise<AuthResult> {
  const { walletSignature, challengeId, walletAddressHint } = inputs;

  // Wallet signature is always required. Authorization header is required only when
  // no Sui identity path is available — in production Sui mode, a Bearer token
  // would cause auth_mode_conflict, so it must be absent.
  if (!walletSignature) {
    return { ok: false, reason: 'auth_missing' };
  }

  let resolveInputs = inputs;

  // Challenge-based path: consume the one-time challenge and verify the
  // wallet signed its server-issued message. Falls back to the static
  // X-Signature-Message path when no X-Challenge-Id header is present
  // (dev auth compatibility).
  if (challengeId) {
    if (!walletAddressHint) {
      return { ok: false, reason: 'wallet_signature_invalid' };
    }

    const consumeResult = consumeChallenge(challengeId, walletAddressHint);
    if (!consumeResult.ok) {
      return { ok: false, reason: 'wallet_signature_invalid' };
    }

    const sigResult = await verifyChallengeSignature(
      consumeResult.challenge.message,
      walletSignature,
      walletAddressHint
    );
    if (!sigResult.ok) {
      return { ok: false, reason: 'wallet_signature_invalid' };
    }

    // Inject verified challenge message so resolveServerViewerContext can
    // re-derive the wallet address through the existing verification path.
    resolveInputs = { ...inputs, signatureMessage: consumeResult.challenge.message };
  }

  const context = await resolveServerViewerContext(resolveInputs);

  if (context.kind === 'anonymous') {
    return { ok: false, reason: 'wallet_signature_invalid' };
  }

  if (context.kind === 'wallet_verified') {
    return { ok: false, reason: 'character_token_invalid' };
  }

  if (context.kind === 'auth_mode_conflict') {
    return { ok: false, reason: 'auth_mode_conflict' };
  }

  if (context.kind === 'identity_resolution_failed') {
    return { ok: false, reason: 'identity_resolution_failed' };
  }

  return {
    ok: true,
    auth: {
      walletAddress: context.walletAddress,
      characterId: context.characterId,
      tribeId: context.tribeId,
      identitySource: context.identitySource,
    },
  };
}
