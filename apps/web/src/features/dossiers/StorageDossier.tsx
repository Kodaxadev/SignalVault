import type { ResolvedEntity } from '@/features/entities';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { DossierHeader } from '@/features/dossiers/DossierHeader';
import { DossierSignalSummary } from '@/features/dossiers/DossierSignalSummary';
import { DossierWarningPanel } from '@/features/dossiers/DossierWarningPanel';
import { DossierStatusBadge } from '@/features/dossiers/DossierStatusBadge';
import { DossierIntelHealthPanel } from '@/features/dossiers/DossierIntelHealthPanel';
import { deriveStorageStatus, deriveDossierWarnings } from '@/features/dossiers/dossierStatus';
import { getSignalsForEntity } from '@/features/dossiers/dossierSignals';
import { getStalenessSummary } from '@/features/staleness/staleSignalQueries';
import { getContradictionsForEntity } from '@/features/contradictions/contradictionRules';

export function StorageDossier({ entity, onSignalCreated }: { entity: ResolvedEntity; onSignalCreated?: (message: string) => void }) {
  const { getAllSignals } = useSignalContext();
  const allSignals = getAllSignals();
  const signals = getSignalsForEntity(allSignals, entity.entityKey);
  const status = deriveStorageStatus(signals);
  const warnings = deriveDossierWarnings({ entity, signals, status: { type: 'storage', status } });
  const stalenessSummary = getStalenessSummary(signals);
  const contradictions = getContradictionsForEntity(signals, entity.entityKey, 'smart_storage_unit');

  return (
    <div className="space-y-4">
      <DossierHeader entity={entity} />

      <div className="flex gap-3 text-xs">
        <div>
          <span className="text-gray-500">Access: </span>
          <DossierStatusBadge variant={status.access} />
        </div>
        <div>
          <span className="text-gray-500">Manifest: </span>
          <DossierStatusBadge variant={status.manifest} />
        </div>
      </div>

      <DossierSignalSummary signals={signals} />
      <DossierIntelHealthPanel stalenessSummary={stalenessSummary} contradictions={contradictions} warnings={warnings} />
      <DossierWarningPanel warnings={warnings} />
      <QuickSignalButtons entityType="smart_storage_unit" resolvedEntity={entity} onSignalCreated={onSignalCreated} />
      <SignalList entityKey={entity.entityKey} />
    </div>
  );
}
