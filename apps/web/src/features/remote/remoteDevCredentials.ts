import { env } from '@/lib/env';
import type { RemoteCredentials } from './remoteAuthHeaders';

// Remote sync alpha uses dev auth credentials only.
// Real wallet signing is deferred to a future phase.
//
// To enable: set VITE_REMOTE_DEV_AUTH=true and the four credential vars.
// Never set these in production — dev auth is not production auth.
export function getRemoteDevCredentials(): RemoteCredentials | null {
  if (env.VITE_REMOTE_DEV_AUTH !== 'true') return null;

  const characterJwt = env.VITE_REMOTE_DEV_CHARACTER_JWT;
  const walletSignature = env.VITE_REMOTE_DEV_WALLET_SIGNATURE;
  const signatureMessage = env.VITE_REMOTE_DEV_SIGNATURE_MESSAGE ?? 'signal-vault:dev';

  if (!characterJwt || !walletSignature) return null;

  return {
    characterJwt,
    walletSignature,
    signatureMessage,
  };
}

export function isRemoteDevAuthEnabled(): boolean {
  return env.VITE_REMOTE_DEV_AUTH === 'true';
}
