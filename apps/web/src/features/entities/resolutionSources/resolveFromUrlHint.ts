import type { EntityType, ObjectContext } from '@/features/entities';
import { buildEntityKey } from '@/features/entities/buildEntityKey';
import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';

const VALID_NON_UNKNOWN_TYPES: EntityType[] = [
  'smart_gate', 'smart_storage_unit', 'smart_turret', 'network_node',
  'character', 'tribe', 'system', 'route', 'market', 'item',
];

export function resolveFromUrlHint(context: ObjectContext): EntityClassificationClaim[] {
  const entityKey = buildEntityKey({
    tenant: context.tenant,
    itemId: context.itemId,
    objectId: context.objectId,
  });

  const hasAnyContext = context.tenant || context.itemId || context.objectId;
  if (!hasAnyContext) return [];

  const baseEvidence = {
    tenant: context.tenant,
    itemId: context.itemId,
    objectId: context.objectId,
  };

  // Case: type hint provided
  const hintedType = context.entityType;
  if (VALID_NON_UNKNOWN_TYPES.includes(hintedType)) {
    return [
      createClaim(entityKey, hintedType, 'url_hint', {
        ...baseEvidence,
        hintedType,
      }),
    ];
  }

  // Case: invalid hint (e.g. 'banana') — record it but don't accept
  if (hintedType !== 'unknown') {
    return [
      createClaim(entityKey, 'unknown', 'unknown', {
        ...baseEvidence,
        invalidHint: hintedType,
        hintedType,
      }),
    ];
  }

  // Case: no type hint or explicitly unknown
  return [
    createClaim(entityKey, 'unknown', 'url_hint', baseEvidence),
  ];
}
