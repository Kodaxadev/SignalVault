import type { SignalSyncState } from '@/features/signals/signalTypes';

const syncLabels: Record<SignalSyncState, string> = {
  local_only: 'Local Only',
  draft: 'Draft',
  remote_pending: 'Pending',
  remote_saved: 'Saved',
  sync_failed: 'Failed',
};

const syncColors: Record<SignalSyncState, string> = {
  local_only: 'bg-gray-800 text-gray-400',
  draft: 'bg-yellow-800 text-yellow-300',
  remote_pending: 'bg-blue-800 text-blue-300',
  remote_saved: 'bg-green-800 text-green-300',
  sync_failed: 'bg-red-800 text-red-300',
};

export function SignalSyncBadge({ syncState }: { syncState: SignalSyncState }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${syncColors[syncState]}`}
    >
      {syncLabels[syncState]}
    </span>
  );
}
