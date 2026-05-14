import { useMemo } from 'react';
import { deriveRouteWarnings } from '@/features/routes';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { useCurrentSystem } from '@/features/worldContext';
import { useCompanionBridgePublisher } from './useCompanionBridgePublisher';

export function CompanionBridgePublisher() {
  const { currentSystem } = useCurrentSystem();
  const { getAllSignals } = useSignalContext();
  const signals = getAllSignals();

  const warnings = useMemo(() => {
    if (!currentSystem) return [];

    return deriveRouteWarnings(
      signals,
      [currentSystem.systemId],
      new Map([[currentSystem.systemId, currentSystem.systemName]]),
    );
  }, [currentSystem, signals]);

  useCompanionBridgePublisher({
    currentSystem,
    warnings,
    signals,
  });

  return null;
}
