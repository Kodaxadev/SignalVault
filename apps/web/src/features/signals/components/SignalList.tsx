import { useSignalContext } from '@/features/signals/SignalProvider';
import { useViewerSession } from '@/features/viewer';
import { canReadSignal } from '@/features/permissions';
import { SignalCard } from './SignalCard';

export function SignalList({ entityKey }: { entityKey: string }) {
  const { getSignals } = useSignalContext();
  const { viewer } = useViewerSession();
  const signals = getSignals(entityKey).filter((s) => canReadSignal(viewer, s));

  if (signals.length === 0) {
    return (
      <div className="rounded border border-gray-800 p-3 text-center">
        <p className="text-xs text-gray-500">No signals yet for this object.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400">Recent Signals</h3>
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}
