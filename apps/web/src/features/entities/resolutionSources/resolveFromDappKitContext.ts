import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { SmartObjectContextSnapshot } from '@/features/entities/smartObjectContextSnapshot';
import { smartObjectToEntityClaim } from './smartObjectToEntityClaim';

export function resolveFromDappKitContext(
  snapshot: SmartObjectContextSnapshot,
): EntityClassificationClaim[] {
  return smartObjectToEntityClaim(snapshot);
}
