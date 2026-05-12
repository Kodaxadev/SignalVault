import { useSignalContext } from '@/features/signals/SignalProvider';
import { useViewerSession } from '@/features/viewer';
import { canReadSignal } from '@/features/permissions';
import { SignalCard } from './SignalCard';
import { TerminalPanel } from '@/features/ingame';

export function SignalList({ entityKey }: { entityKey: string }) {
  const { getSignals } = useSignalContext();
  const { viewer } = useViewerSession();
  const signals = getSignals(entityKey).filter((s) => canReadSignal(viewer, s));

  if (signals.length === 0) {
    return (
      <TerminalPanel title="Intel Memory" code="EMPTY" headingLevel={3}>
        <p className="text-center font-mono text-xs uppercase text-zinc-500">
          No signals yet for this object.
        </p>
      </TerminalPanel>
    );
  }

  return (
    <TerminalPanel title="Intel Memory" code={`${signals.length} LOCAL`} headingLevel={3}>
      <div className="space-y-2">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
      </div>
    </TerminalPanel>
  );
}
