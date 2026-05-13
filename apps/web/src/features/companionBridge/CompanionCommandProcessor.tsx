import { useSignalContext } from '@/features/signals/SignalProvider';
import { useCompanionCommandProcessor } from './useCompanionCommandProcessor';

export function CompanionCommandProcessor() {
  const { addSignalPersisted } = useSignalContext();

  useCompanionCommandProcessor({ addSignal: addSignalPersisted });

  return null;
}
