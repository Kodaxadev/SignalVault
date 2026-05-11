import type { ResolvedEntity } from '@/features/entities';
import type { LinkedEntity } from '@/features/signals/signalTypes';

export function createEntitySnapshot(resolvedEntity: ResolvedEntity): LinkedEntity[] {
  return [
    {
      entityId: resolvedEntity.entityKey,
      type: resolvedEntity.type,
      label: resolvedEntity.label,
      tenant: resolvedEntity.tenant,
      itemId: resolvedEntity.itemId,
      objectId: resolvedEntity.objectId,
      resolutionConfidence: resolvedEntity.confidence,
    },
  ];
}
