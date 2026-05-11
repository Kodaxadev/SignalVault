import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { WorldApiEntityContext } from './worldApiEntityClaimTypes';

// World API may create claims only for: system, tribe, item
// It must NOT classify smart_gate, smart_storage_unit, market, smart_turret,
// network_node, or other Smart Assemblies — World API type/category/group
// data does not prove Smart Assembly identity.

export function resolveFromWorldApi(
  entityKey: string,
  worldApiContext: WorldApiEntityContext | null | undefined,
): EntityClassificationClaim[] {
  if (!worldApiContext) return [];

  switch (worldApiContext.kind) {
    case 'system': {
      const ctx = worldApiContext.context;
      return [
        createClaim(
          entityKey,
          'system',
          'world_api',
          { itemId: ctx.id, raw: ctx },
          ctx.name,
        ),
      ];
    }

    case 'tribe': {
      const ctx = worldApiContext.context;
      return [
        createClaim(
          entityKey,
          'tribe',
          'world_api',
          { itemId: ctx.id, raw: ctx },
          ctx.name,
        ),
      ];
    }

    case 'type': {
      const ctx = worldApiContext.context;
      // Conservative: World API type data enriches label and evidence only.
      // It does not prove Smart Assembly subtype (gate, storage, turret, etc.).
      // Claim as 'item' regardless of groupName or categoryName.
      return [
        createClaim(
          entityKey,
          'item',
          'world_api',
          { itemId: ctx.id, raw: ctx },
          ctx.name,
        ),
      ];
    }
  }
}
