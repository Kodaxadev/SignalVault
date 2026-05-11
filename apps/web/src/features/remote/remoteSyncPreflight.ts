import type { Signal, SignalVisibility } from '@/features/signals/signalTypes';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { RemoteCredentials } from './remoteAuthHeaders';
import { buildRemoteAuthHeaders } from './remoteAuthHeaders';
import { checkSignalEligibility } from './remoteEligibility';
import { checkBackendHealth } from './remoteBackendHealth';

export type RemoteSyncPreflightResult =
  | { status: 'ready' }
  | {
      status: 'blocked';
      reason:
        | 'backend_not_configured'
        | 'backend_unreachable'
        | 'viewer_not_authenticated'
        | 'auth_headers_unavailable'
        | 'signal_local_private'
        | 'anonymous_author'
        | 'visibility_not_remote_eligible'
        | 'policy_denied'
        | 'remote_writes_disabled';
      message: string;
    };

export interface RemoteSyncPreflightContext {
  signal: Signal;
  viewer: ViewerContext;
  backendUrl: string | undefined;
  credentials?: RemoteCredentials;
  // True when wallet signing is available (09I+ real signing path).
  // When set, satisfies the auth check even without dev credentials.
  signingAvailable?: boolean;
}

const TRIBE_SCOPED: SignalVisibility[] = ['tribe', 'officer', 'scout_cell'];

export async function checkRemoteSyncPreflight(
  ctx: RemoteSyncPreflightContext
): Promise<RemoteSyncPreflightResult> {
  const { signal, viewer, backendUrl, credentials, signingAvailable } = ctx;

  // 1. Backend must be configured
  if (!backendUrl) {
    return {
      status: 'blocked',
      reason: 'backend_not_configured',
      message: 'VITE_REMOTE_SYNC_URL is not configured.',
    };
  }

  // 2. Backend must be reachable
  const health = await checkBackendHealth(backendUrl);
  if (!health.reachable) {
    return {
      status: 'blocked',
      reason: 'backend_unreachable',
      message: `Backend at ${backendUrl} is not reachable.`,
    };
  }

  // 3. Remote writes must be enabled on the server
  if (!health.writesEnabled) {
    return {
      status: 'blocked',
      reason: 'remote_writes_disabled',
      message: 'Remote signal writes are disabled on the backend (ENABLE_REMOTE_SIGNAL_WRITES=false).',
    };
  }

  // 4. Viewer must be authenticated
  if (viewer.state === 'anonymous') {
    return {
      status: 'blocked',
      reason: 'viewer_not_authenticated',
      message: 'Viewer must be wallet-connected or character-resolved to sync remotely.',
    };
  }

  // 5. Auth must be available: dev credentials OR wallet signing
  const devAuthReady = buildRemoteAuthHeaders(viewer, credentials).status === 'ready';
  if (!signingAvailable && !devAuthReady) {
    const devAuthBlocked = buildRemoteAuthHeaders(viewer, credentials);
    return {
      status: 'blocked',
      reason: 'auth_headers_unavailable',
      message: devAuthBlocked.status === 'blocked'
        ? devAuthBlocked.message
        : 'No auth method available. Enable dev auth or connect a wallet with signing support.',
    };
  }

  // 6. Signal must not be local_private or anonymous-authored; visibility must be remote-eligible
  const eligibility = checkSignalEligibility(signal);
  if (!eligibility.eligible) {
    return {
      status: 'blocked',
      reason: eligibility.reason,
      message: eligibility.message,
    };
  }

  // 7. Policy: tribe-scoped signals require character resolution + tribe identity
  if (TRIBE_SCOPED.includes(signal.visibility as SignalVisibility)) {
    if (viewer.state !== 'character_resolved' || !viewer.tribeId) {
      return {
        status: 'blocked',
        reason: 'policy_denied',
        message: `Visibility "${signal.visibility}" requires a character with tribe identity.`,
      };
    }
  }

  return { status: 'ready' };
}
