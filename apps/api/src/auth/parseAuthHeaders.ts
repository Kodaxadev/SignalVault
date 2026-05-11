import type { AuthInputs } from './resolveServerViewerContext';

export function parseAuthHeaders(headers: Headers): AuthInputs {
  return {
    authorizationHeader: headers.get('authorization') ?? undefined,
    walletSignature: headers.get('x-wallet-signature') ?? undefined,
    signatureMessage: headers.get('x-signature-message') ?? undefined,
    walletAddressHint: headers.get('x-wallet-address') ?? undefined,
    challengeId: headers.get('x-challenge-id') ?? undefined,
  };
}
