import { useSyncExternalStore } from 'react';
import { subscribeLocalDbStatus, getLocalDbStatus } from '@/features/local/localDbStatus';

const copyMessage: Record<string, string> = {
  degraded: 'Some data may not be saved. Local storage issue detected.',
  unavailable: 'Cannot save data. Browser storage unavailable.',
};

function useLocalDbStatus() {
  return useSyncExternalStore(
    (cb) => subscribeLocalDbStatus(cb),
    () => getLocalDbStatus(),
    () => 'checking' as const,
  );
}

export function LocalDbErrorBanner() {
  const status = useLocalDbStatus();

  if (status === 'ready' || status === 'checking') {
    return null;
  }

  const message = copyMessage[status] ?? 'Local storage issue detected.';

  return (
    <div className="rounded border border-red-800 bg-red-950 px-3 py-2 text-xs text-red-300">
      {message}
    </div>
  );
}
