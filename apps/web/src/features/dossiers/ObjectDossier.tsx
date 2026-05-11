import type { ResolvedEntity } from '@/features/entities';
import { GateDossier } from './GateDossier';
import { StorageDossier } from './StorageDossier';
import { MarketDossier } from './MarketDossier';
import { SystemDossier } from './SystemDossier';
import { RouteDossier } from './RouteDossier';
import { TribeDossier } from './TribeDossier';
import { UnknownObjectDossier } from './UnknownObjectDossier';

export function ObjectDossier({ entity, onSignalCreated }: { entity: ResolvedEntity; onSignalCreated?: (message: string) => void }) {
  switch (entity.type) {
    case 'smart_gate':
      return <GateDossier entity={entity} onSignalCreated={onSignalCreated} />;
    case 'smart_storage_unit':
      return <StorageDossier entity={entity} onSignalCreated={onSignalCreated} />;
    case 'market':
      return <MarketDossier entity={entity} onSignalCreated={onSignalCreated} />;
    case 'system':
      return <SystemDossier entity={entity} onSignalCreated={onSignalCreated} />;
    case 'route':
      return <RouteDossier entity={entity} onSignalCreated={onSignalCreated} />;
    case 'tribe':
      return <TribeDossier entity={entity} onSignalCreated={onSignalCreated} />;
    default:
      return <UnknownObjectDossier resolved={entity} onSignalCreated={onSignalCreated} />;
  }
}
