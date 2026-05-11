import type { Signal } from '@/features/signals/signalTypes';
import { signalToRemotePayload } from './remoteSignalTypes';
import { remotePost } from './remoteClient';
import type { CreateSignalResponse } from './remoteApiContracts';

export type RemotePushResult =
  | { ok: true; remoteId: string }
  | { ok: false; reason: string };

// Pushes a single Signal to the remote API using pre-built auth headers.
// Caller is responsible for all auth header construction (dev or signed path).
// Caller is responsible for syncState transitions:
//   set remote_pending before calling, then apply result.
export async function pushSignalToRemote(
  signal: Signal,
  backendUrl: string,
  headers: Record<string, string>
): Promise<RemotePushResult> {
  const payload = signalToRemotePayload(signal);
  if (!payload) {
    return {
      ok: false,
      reason: 'Signal cannot be converted to remote payload (check visibility)',
    };
  }

  try {
    const response = await remotePost<CreateSignalResponse>(
      { backendUrl },
      '/api/v1/signals',
      { signal: payload },
      { headers }
    );
    return { ok: true, remoteId: response.signalId };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'Network error during remote push',
    };
  }
}
