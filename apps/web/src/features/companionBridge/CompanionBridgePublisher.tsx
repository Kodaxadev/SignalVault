import { useMemo } from 'react';
import { deriveRouteWarnings } from '@/features/routes';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { useCurrentSystem } from '@/features/worldContext';
import { useFrontierSystemIntelQuery } from '@/features/frontierStaticData/useFrontierSystemIntelQuery';
import { useCompanionBridgePublisher } from './useCompanionBridgePublisher';

export function CompanionBridgePublisher() {
  const { currentSystem } = useCurrentSystem();
  const { getAllSignals } = useSignalContext();
  const signals = getAllSignals();
  const staticIntelQuery = useFrontierSystemIntelQuery(currentSystem?.systemId);

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
    currentSystemStaticIntel: staticIntelQuery.data
      ? {
          siteCount: staticIntelQuery.data.siteCount,
          beltGroups: staticIntelQuery.data.beltGroups,
          trojanGroups: staticIntelQuery.data.trojanGroups,
          dangerTaggedGroups: staticIntelQuery.data.dangerTaggedGroups,
          tags: staticIntelQuery.data.tags,
        }
      : null,
    warnings,
    signals,
  });

  return null;
}
