import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { SmartObjectContextSnapshot } from '@/features/entities/smartObjectContextSnapshot';
import type { EntityType } from '@/features/entities';

const ASSEMBLY_TYPE_MAP: Record<string, EntityType> = {
  SmartGate: 'smart_gate',
  SmartStorageUnit: 'smart_storage_unit',
  SmartTurret: 'smart_turret',
  NetworkNode: 'network_node',
};

function mapAssemblyType(assemblyType: string | undefined): EntityType {
  if (!assemblyType) return 'unknown';
  return ASSEMBLY_TYPE_MAP[assemblyType] ?? 'unknown';
}

export function smartObjectToEntityClaim(snapshot: SmartObjectContextSnapshot): EntityClassificationClaim[] {
  if (!snapshot.available) return [];

  const entityType = mapAssemblyType(snapshot.assemblyType);
  const entityKey = snapshot.objectId ?? `dappkit-${snapshot.tenant ?? 'unknown'}`;

  return [
    createClaim(entityKey, entityType, 'dappkit_current_object', {
      tenant: snapshot.tenant,
      objectId: snapshot.objectId,
      raw: snapshot.raw,
    }),
  ];
}
