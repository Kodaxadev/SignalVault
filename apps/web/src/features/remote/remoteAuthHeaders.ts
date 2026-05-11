import type { ViewerContext } from '@/features/viewer/viewerTypes';

export interface RemoteCredentials {
  characterJwt: string;
  walletSignature: string;
  signatureMessage: string;
}

export type RemoteAuthHeaderResult =
  | { status: 'ready'; headers: Record<string, string> }
  | {
      status: 'blocked';
      reason:
        | 'viewer_not_authenticated'
        | 'wallet_signature_unavailable'
        | 'character_token_unavailable'
        | 'unsupported_viewer_state';
      message: string;
    };

// Builds the HTTP headers required for authenticated remote API requests.
//
// Returns 'blocked' when credentials are unavailable — this is the expected
// result in 09G preflight since wallet signing is not yet implemented.
// Real credential injection happens in Phase 09H.
//
// Dev auth note: VITE_REMOTE_DEV_AUTH=true enables passing mock credentials
// via the `devCredentials` argument for local testing only.
// Dev auth is not production auth.
export function buildRemoteAuthHeaders(
  viewer: ViewerContext,
  credentials?: RemoteCredentials
): RemoteAuthHeaderResult {
  if (viewer.state === 'anonymous') {
    return {
      status: 'blocked',
      reason: 'viewer_not_authenticated',
      message: 'Viewer must be wallet-connected or character-resolved to build auth headers.',
    };
  }

  if (viewer.state === 'wallet_connected') {
    return {
      status: 'blocked',
      reason: 'character_token_unavailable',
      message: 'Character JWT required. Viewer is wallet-connected but not character-resolved.',
    };
  }

  if (viewer.state !== 'character_resolved') {
    return {
      status: 'blocked',
      reason: 'unsupported_viewer_state',
      message: `Unsupported viewer state: ${viewer.state}`,
    };
  }

  if (!credentials) {
    return {
      status: 'blocked',
      reason: 'wallet_signature_unavailable',
      message:
        'Wallet signature and character JWT are required but not yet available. ' +
        'Signing capability will be added in Phase 09H.',
    };
  }

  const { characterJwt, walletSignature, signatureMessage } = credentials;

  if (!characterJwt) {
    return {
      status: 'blocked',
      reason: 'character_token_unavailable',
      message: 'Character JWT is empty.',
    };
  }

  if (!walletSignature) {
    return {
      status: 'blocked',
      reason: 'wallet_signature_unavailable',
      message: 'Wallet signature is empty.',
    };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${characterJwt}`,
    'X-Wallet-Signature': walletSignature,
    'X-Signature-Message': signatureMessage,
  };

  if (viewer.walletAddress) {
    headers['X-Wallet-Address'] = viewer.walletAddress;
  }

  return { status: 'ready', headers };
}
