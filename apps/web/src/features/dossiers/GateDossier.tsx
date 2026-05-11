import type { ResolvedEntity } from '@/features/entities';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { DossierHeader } from '@/features/dossiers/DossierHeader';
import { DossierSignalSummary } from '@/features/dossiers/DossierSignalSummary';
import { DossierWarningPanel } from '@/features/dossiers/DossierWarningPanel';
import { DossierStatusBadge } from '@/features/dossiers/DossierStatusBadge';
import { DossierIntelHealthPanel } from '@/features/dossiers/DossierIntelHealthPanel';
import { deriveGateStatus, deriveDossierWarnings } from '@/features/dossiers/dossierStatus';
import { getSignalsForEntity } from '@/features/dossiers/dossierSignals';
import { getStalenessSummary } from '@/features/staleness/staleSignalQueries';
import { getContradictionsForEntity } from '@/features/contradictions/contradictionRules';

export function GateDossier({ entity, onSignalCreated }: { entity: ResolvedEntity; onSignalCreated?: (message: string) => void }) {
  const { getAllSignals } = useSignalContext();
  const allSignals = getAllSignals();
  const signals = getSignalsForEntity(allSignals, entity.entityKey);
  const status = deriveGateStatus(signals);
  const warnings = deriveDossierWarnings({ entity, signals, status: { type: 'gate', status } });
  const stalenessSummary = getStalenessSummary(signals);
  const contradictions = getContradictionsForEntity(signals, entity.entityKey, 'smart_gate');

  return (
    <div className="space-y-4">
      <DossierHeader entity={entity} />

      <div className="flex gap-3 text-xs">
        <div>
          <span className="text-gray-500">Risk: </span>
          <DossierStatusBadge variant={status.risk} />
        </div>
        <div>
          <span className="text-gray-500">Access: </span>
          <DossierStatusBadge variant={status.access} />
        </div>
      </div>

      <DossierSignalSummary signals={signals} />
      <DossierIntelHealthPanel stalenessSummary={stalenessSummary} contradictions={contradictions} warnings={warnings} />
      <DossierWarningPanel warnings={warnings} />
      <QuickSignalButtons entityType="smart_gate" resolvedEntity={entity} onSignalCreated={onSignalCreated} />
      <SignalList entityKey={entity.entityKey} />
    </div>
  );
}
