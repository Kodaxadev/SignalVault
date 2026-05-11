import type { ResolvedEntity } from '@/features/entities';
import React from 'react';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { DossierHeader } from '@/features/dossiers/DossierHeader';
import { DossierSignalSummary } from '@/features/dossiers/DossierSignalSummary';
import { DossierWarningPanel } from '@/features/dossiers/DossierWarningPanel';
import { DossierStatusBadge } from '@/features/dossiers/DossierStatusBadge';
import { DossierIntelHealthPanel } from '@/features/dossiers/DossierIntelHealthPanel';
import { deriveRouteStatus, deriveDossierWarnings } from '@/features/dossiers/dossierStatus';
import { getSignalsForEntity } from '@/features/dossiers/dossierSignals';
import { getStalenessSummary } from '@/features/staleness/staleSignalQueries';
import { getContradictionsForEntity } from '@/features/contradictions/contradictionRules';
import { useSolarSystemQuery } from '@/features/worldApi/solarSystems/useSolarSystemQuery';
import { WorldApiTopologyPanel } from '@/features/worldApi/components/WorldApiTopologyPanel';
import { deriveRouteWarnings, RouteWarningList } from '@/features/routes';

export function RouteDossier({ entity, onSignalCreated }: { entity: ResolvedEntity; onSignalCreated?: (message: string) => void }) {
  const { getAllSignals } = useSignalContext();
  const allSignals = getAllSignals();
  const signals = getSignalsForEntity(allSignals, entity.entityKey);
  const status = deriveRouteStatus(signals);
  const warnings = deriveDossierWarnings({ entity, signals, status: { type: 'route', status } });
  const stalenessSummary = getStalenessSummary(signals);
  const contradictions = getContradictionsForEntity(signals, entity.entityKey, 'route');

  // Narrow World API topology — only when route has a known system ID
  const firstSystemId = entity.entityKey || undefined;
  const systemQuery = useSolarSystemQuery(firstSystemId);

  // Build topology list from primary system + its connected systems (limit 5)
  const topologySystems = React.useMemo(() => {
    if (!systemQuery.data) return [];
    const primary = systemQuery.data;
    const connectedIds = primary.connectedSystemIds.slice(0, 5);
    return [
      primary,
      ...connectedIds.map((id) => ({
        id,
        name: id,
        constellationId: '',
        regionId: '',
        connectedSystemIds: [],
      })),
    ];
  }, [systemQuery.data]);

  // Route warnings: derive from local signals linked to this system + connected systems
  const routeSystemIds = React.useMemo(() => {
    const ids = firstSystemId ? [firstSystemId] : [];
    if (systemQuery.data) {
      ids.push(...systemQuery.data.connectedSystemIds);
    }
    return ids;
  }, [firstSystemId, systemQuery.data]);

  const systemNames = React.useMemo(() => {
    const map = new Map<string, string>();
    if (systemQuery.data) map.set(systemQuery.data.id, systemQuery.data.name);
    return map;
  }, [systemQuery.data]);

  const routeWarnings = React.useMemo(
    () => deriveRouteWarnings(allSignals, routeSystemIds, systemNames),
    [allSignals, routeSystemIds, systemNames]
  );

  return (
    <div className="space-y-4">
      <DossierHeader entity={entity} />

      {systemQuery.status === 'success' && systemQuery.data && topologySystems.length > 0 && (
        <WorldApiTopologyPanel systems={topologySystems} />
      )}

      <RouteWarningList
        warnings={routeWarnings}
        worldApiAvailable={systemQuery.status !== 'error'}
      />

      <div className="flex gap-3 text-xs">
        <div>
          <span className="text-gray-500">Risk: </span>
          <DossierStatusBadge variant={status.risk} />
        </div>
        {status.blockedCount > 0 && (
          <span className="text-yellow-400">{status.blockedCount} blocked</span>
        )}
        {status.unsafeCount > 0 && (
          <span className="text-red-400">{status.unsafeCount} unsafe</span>
        )}
      </div>

      <DossierSignalSummary signals={signals} />
      <DossierIntelHealthPanel stalenessSummary={stalenessSummary} contradictions={contradictions} warnings={warnings} />
      <DossierWarningPanel warnings={warnings} />
      <QuickSignalButtons entityType="route" resolvedEntity={entity} onSignalCreated={onSignalCreated} />
      <SignalList entityKey={entity.entityKey} />
    </div>
  );
}
