import type { ObjectContext } from '@/features/entities';
import { buildEntityKey } from '@/features/entities/buildEntityKey';
import { resolveFromUrlHint } from '@/features/entities/resolutionSources/resolveFromUrlHint';
import { resolveFromMockRegistry } from '@/features/entities/mockEntityRegistry';
import type { ManualClassificationMemory } from '@/features/entities/resolutionSources/resolveFromManualRegistry';
import { resolveFromManualRegistry } from '@/features/entities/resolutionSources/resolveFromManualRegistry';
import { resolveFromDappKitContext } from '@/features/entities/resolutionSources/resolveFromDappKitContext';
import { resolveFromWorldApi } from '@/features/entities/resolutionSources/resolveFromWorldApi';
import type { WorldApiEntityContext } from '@/features/entities/resolutionSources/worldApiEntityClaimTypes';
import { mergeResolutionCandidates } from '@/features/entities/mergeResolutionCandidates';
import type { ResolvedEntity } from '@/features/entities/entityResolutionTypes';
import type { SmartObjectContextSnapshot } from '@/features/entities/smartObjectContextSnapshot';

export function resolveEntity(
  context: ObjectContext,
  options?: {
    manualMemory?: ManualClassificationMemory;
    dappKitSnapshot?: SmartObjectContextSnapshot;
    worldApiContext?: WorldApiEntityContext | null;
  },
): ResolvedEntity {
  const entityKey = buildEntityKey({
    tenant: context.tenant,
    itemId: context.itemId,
    objectId: context.objectId,
  });

  // Collect claims from all sources
  const claims: ReturnType<typeof resolveFromUrlHint> = [];
  claims.push(...resolveFromUrlHint(context));
  claims.push(...resolveFromMockRegistry(entityKey));
  claims.push(...resolveFromDappKitContext(options?.dappKitSnapshot ?? { status: 'unavailable', available: false }));

  if (options?.worldApiContext) {
    claims.push(...resolveFromWorldApi(entityKey, options.worldApiContext));
  }

  if (options?.manualMemory) {
    claims.push(...resolveFromManualRegistry(entityKey, options.manualMemory));
  }

  const mergeResult = mergeResolutionCandidates(claims);

  const entityTypeLabel = mergeResult.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    entityKey,
    entityId: entityKey,
    tenant: context.tenant,
    itemId: context.itemId,
    objectId: context.objectId,
    type: mergeResult.type,
    label: mergeResult.winningCandidate?.label ?? entityTypeLabel,
    confidence: mergeResult.confidence,
    sources: [...new Set(claims.map((c) => c.source))],
    sourceClaims: claims,
    updatedAt: new Date().toISOString(),
  };
}
