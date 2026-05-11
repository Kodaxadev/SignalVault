import type { Signal } from '@/features/signals/signalTypes';

export function RemoteSyncStatusBadge({ signal }: { signal: Signal }) {
  const { syncState, remote } = signal;

  if (syncState === 'remote_saved' && remote?.remoteId) {
    return (
      <span
        className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-green-900 text-green-300"
        title={`Remote ID: ${remote.remoteId}`}
      >
        Remote · {remote.remoteId.slice(0, 8)}
      </span>
    );
  }

  if (syncState === 'sync_failed') {
    const errorDetail = remote?.lastError ? ` ${remote.lastError}` : '';
    return (
      <span
        className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-red-900 text-red-300"
        title={`Push failed — your Signal is preserved locally.${errorDetail}`}
      >
        Push failed
      </span>
    );
  }

  if (syncState === 'remote_pending') {
    return (
      <span className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-blue-900 text-blue-300">
        Syncing…
      </span>
    );
  }

  return null;
}
