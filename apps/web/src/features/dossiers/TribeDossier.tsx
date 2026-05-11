import type { ResolvedEntity } from '@/features/entities';
import { useViewerSession } from '@/features/viewer';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { DossierHeader } from '@/features/dossiers/DossierHeader';
import { WorldApiTribePanel } from '@/features/worldApi/components/WorldApiTribePanel';
import { TribeVaultReadinessPanel } from '@/features/tribeVault/components/TribeVaultReadinessPanel';
import { TribeScopeExplainer } from '@/features/tribeVault/components/TribeScopeExplainer';

export function TribeDossier({ entity, onSignalCreated }: { entity: ResolvedEntity; onSignalCreated?: (message: string) => void }) {
  const { viewer } = useViewerSession();

  return (
    <div className="space-y-4">
      <DossierHeader entity={entity} />
      <WorldApiTribePanel tribeId={entity.entityId} />
      <TribeVaultReadinessPanel />
      <TribeScopeExplainer viewer={viewer} />
      <QuickSignalButtons entityType="tribe" resolvedEntity={entity} onSignalCreated={onSignalCreated} />
      <SignalList entityKey={entity.entityKey} />
    </div>
  );
}
