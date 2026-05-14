import { useState } from 'react';
import type { Signal } from '@/features/signals/signalTypes';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { useViewerSession } from '@/features/viewer/ViewerSessionProvider';
import { env } from '@/lib/env';
import { checkSignalEligibility } from '../remoteEligibility';
import { checkRemoteSyncPreflight } from '../remoteSyncPreflight';
import { getRemoteDevCredentials, isRemoteDevAuthEnabled } from '../remoteDevCredentials';
import { buildRemoteAuthHeaders } from '../remoteAuthHeaders';
import { pushSignalToRemote } from '../remoteSignalPush';
import { applyRemotePending, applyRemoteSaved, applyRemoteFailed } from '../remoteSignalMapping';
import { useWalletSigningContext } from '../WalletSigningContext';
import { signRemoteChallenge } from '../remoteWalletSigning';
import { buildSignedAuthHeaders } from '../remoteSignedAuthHeaders';
import { RemoteSyncAlphaWarning } from './RemoteSyncAlphaWarning';
import { RemoteSyncBlockedReason } from './RemoteSyncBlockedReason';
import type { BlockedSyncReason } from './RemoteSyncBlockedReason';
import { RemoteSyncRetryPanel } from './RemoteSyncRetryPanel';
import type { WalletSigningSnapshot } from '@/features/frontier/dappKit/walletSigningTypes';

function signingBlockedReason(signing: WalletSigningSnapshot): BlockedSyncReason {
  if (signing.status === 'unavailable') {
    if (signing.reason === 'signing_not_supported') return 'signing_not_supported';
    if (signing.reason === 'wallet_not_connected') return 'wallet_not_connected';
    if (signing.reason === 'provider_missing') return 'provider_missing';
  }
  return 'no_auth_method';
}

export function RemoteSyncButton({ signal }: { signal: Signal }) {
  const { viewer } = useViewerSession();
  const { updateSignal } = useSignalContext();
  const signing = useWalletSigningContext();
  const [isPushing, setIsPushing] = useState(false);
  const [preflightError, setPreflightError] = useState<string | null>(null);

  const backendUrl = env.VITE_REMOTE_SYNC_URL;
  const devAuthEnabled = isRemoteDevAuthEnabled();
  const credentials = getRemoteDevCredentials();
  const signingAvailable = signing.status === 'available';

  if (signal.visibility === 'local_private') {
    return <span className="text-gray-600 text-xs">Local only</span>;
  }

  const eligibility = checkSignalEligibility(signal);
  if (!eligibility.eligible) return null;

  if (signal.syncState === 'remote_saved') return null;

  if (isPushing || signal.syncState === 'remote_pending') {
    return <span className="text-blue-400 text-xs">Syncing…</span>;
  }

  if (!backendUrl) {
    return <RemoteSyncBlockedReason reason="no_backend_url" />;
  }

  if (!devAuthEnabled && !signingAvailable) {
    return <RemoteSyncBlockedReason reason={signingBlockedReason(signing)} />;
  }

  const handlePush = async () => {
    setPreflightError(null);
    setIsPushing(true);

    const preflight = await checkRemoteSyncPreflight({
      signal,
      viewer,
      backendUrl,
      credentials: credentials ?? undefined,
      signingAvailable,
    });

    if (preflight.status === 'blocked') {
      setPreflightError(preflight.message);
      setIsPushing(false);
      return;
    }

    let pushHeaders: Record<string, string>;

    if (devAuthEnabled && credentials) {
      const authResult = buildRemoteAuthHeaders(viewer, credentials);
      if (authResult.status === 'blocked') {
        setPreflightError(authResult.message);
        setIsPushing(false);
        return;
      }
      pushHeaders = authResult.headers;
    } else if (signing.status === 'available') {
      const signingResult = await signRemoteChallenge(
        backendUrl,
        signing.walletAddress,
        signing.signMessage
      );
      if (!signingResult.ok) {
        setPreflightError(signingResult.reason);
        setIsPushing(false);
        return;
      }
      pushHeaders = buildSignedAuthHeaders({
        challengeId: signingResult.challengeId,
        signature: signingResult.signature,
        walletAddress: signingResult.walletAddress,
      });
    } else {
      setPreflightError('No auth method available.');
      setIsPushing(false);
      return;
    }

    const pendingSignal = applyRemotePending(signal);
    updateSignal(pendingSignal);

    const result = await pushSignalToRemote(pendingSignal, backendUrl, pushHeaders);

    if (result.ok) {
      updateSignal(applyRemoteSaved(pendingSignal, result.remoteId));
    } else {
      updateSignal(applyRemoteFailed(pendingSignal, result.reason));
    }

    setIsPushing(false);
  };

  return (
    <div className="flex flex-col items-end gap-0.5">
      <RemoteSyncAlphaWarning devAuthActive={devAuthEnabled} />
      {signal.syncState === 'sync_failed' ? (
        <RemoteSyncRetryPanel
          onRetry={() => { void handlePush(); }}
          lastError={signal.remote?.lastError}
        />
      ) : (
        <button
          onClick={() => { void handlePush(); }}
          className="text-xs text-blue-400 hover:text-blue-300"
          title="Push Signal to remote backend. Your local Signal is always preserved."
        >
          Push remote
        </button>
      )}
      {preflightError && (
        <span className="text-xs text-red-500 max-w-[160px] text-right leading-tight">
          {preflightError}
        </span>
      )}
    </div>
  );
}
