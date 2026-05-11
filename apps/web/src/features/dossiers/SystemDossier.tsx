import type { ResolvedEntity } from '@/features/entities';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { DossierHeader } from '@/features/dossiers/DossierHeader';
import { DossierSignalSummary } from '@/features/dossiers/DossierSignalSummary';
import { DossierWarningPanel } from '@/features/dossiers/DossierWarningPanel';
import { DossierStatusBadge } from '@/features/dossiers/DossierStatusBadge';
import { DossierIntelHealthPanel } from '@/features/dossiers/DossierIntelHealthPanel';
import { deriveSystemStatus, deriveDossierWarnings } from '@/features/dossiers/dossierStatus';
import { getSignalsForEntity } from '@/features/dossiers/dossierSignals';
import { getStalenessSummary } from '@/features/staleness/staleSignalQueries';
import { getContradictionsForEntity } from '@/features/contradictions/contradictionRules';
import { useSolarSystemQuery } from '@/features/worldApi/solarSystems/useSolarSystemQuery';
import { WorldApiContextPanel } from '@/features/worldApi/components/WorldApiContextPanel';
import { WorldApiStatusBadge } from '@/features/worldApi/components/WorldApiStatusBadge';

export function SystemDossier({ entity, onSignalCreated }: { entity: ResolvedEntity; onSignalCreated?: (message: string) => void }) {
  const { getAllSignals } = useSignalContext();
  const allSignals = getAllSignals();
  const signals = getSignalsForEntity(allSignals, entity.entityKey);
  const status = deriveSystemStatus(signals);
  const warnings = deriveDossierWarnings({ entity, signals, status: { type: 'system', status } });
  const stalenessSummary = getStalenessSummary(signals);
  const contradictions = getContradictionsForEntity(signals, entity.entityKey, 'system');

  // World API enrichment — degrades gracefully, never hides local data
  const systemId = entity.entityKey;
  const systemQuery = useSolarSystemQuery(systemId || undefined);

  return (
    <div className="space-y-4">
      <DossierHeader entity={entity} officialLabel={systemQuery.data?.name} />
      <WorldApiStatusBadge
        status={
          systemQuery.status === 'pending'
            ? 'pending'
            : systemQuery.isError || !systemQuery.data
              ? 'unavailable'
              : systemQuery.isStaleCache
                ? 'stale'
                : systemQuery.cacheSource === 'cache'
                  ? 'cache'
                  : 'success'
        }
      />

      <WorldApiContextPanel
        system={systemQuery.data ?? null}
        status={systemQuery.status === 'pending' ? 'pending' : systemQuery.isError ? 'error' : 'success'}
      />

      <div className="flex gap-3 text-xs">
        <div>
          <span className="text-gray-500">Risk: </span>
          <DossierStatusBadge variant={status.risk} />
        </div>
        <span className="text-gray-500">
          {status.totalSignals} signal{status.totalSignals !== 1 ? 's' : ''}
        </span>
        {status.hostileCount > 0 && (
          <span className="text-red-400">{status.hostileCount} hostile</span>
        )}
      </div>

      <DossierSignalSummary signals={signals} />
      <DossierIntelHealthPanel stalenessSummary={stalenessSummary} contradictions={contradictions} warnings={warnings} />
      <DossierWarningPanel warnings={warnings} />
      <QuickSignalButtons entityType="system" resolvedEntity={entity} onSignalCreated={onSignalCreated} />
      <SignalList entityKey={entity.entityKey} />
    </div>
  );
}
