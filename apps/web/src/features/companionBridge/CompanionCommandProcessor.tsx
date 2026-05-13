import { useSignalContext } from '@/features/signals/SignalProvider';
import { useCurrentSystem } from '@/features/worldContext';
import { useCompanionCommandProcessor } from './useCompanionCommandProcessor';

export function CompanionCommandProcessor() {
  const { addSignalPersisted } = useSignalContext();
  const { setCurrentSystemPersisted } = useCurrentSystem();

  useCompanionCommandProcessor({
    addSignal: addSignalPersisted,
    setCurrentSystem: setCurrentSystemPersisted,
  });

  return null;
}
