import type { EntityType } from './entityTypes';

export type EntityResolutionSource =
  | 'url_hint'
  | 'user_manual'
  | 'mock_registry'
  | 'tribe_registry'
  | 'maintainer_registry'
  | 'owner_claim_verified'
  | 'dappkit_current_object'
  | 'world_api'
  | 'indexed'
  | 'onchain_verified'
  | 'unknown';

export const SOURCE_PRIORITY: Record<EntityResolutionSource, number> = {
  onchain_verified: 100,
  indexed: 90,
  dappkit_current_object: 80,
  world_api: 75,
  owner_claim_verified: 70,
  maintainer_registry: 60,
  tribe_registry: 50,
  mock_registry: 40,
  user_manual: 30,
  url_hint: 10,
  unknown: 0,
};

export type EntityClassificationClaim = {
  id: string;
  entityKey: string;
  claimedType: EntityType;
  label?: string;
  source: EntityResolutionSource;
  confidence: 'url_hint' | 'manual' | 'cached' | 'indexed' | 'onchain_verified' | 'conflicted' | 'unknown';
  priority: number;
  claimedBy?: {
    walletAddress?: string;
    characterId?: string;
    tribeId?: string;
  };
  evidence?: {
    tenant?: string;
    itemId?: string;
    objectId?: string;
    hintedType?: EntityType;
    invalidHint?: string;
    notes?: string;
    raw?: unknown;
  };
  createdAt: string;
  supersededAt?: string;
};

export function createClaim(
  entityKey: string,
  type: EntityType,
  source: EntityResolutionSource,
  evidence?: EntityClassificationClaim['evidence'],
  label?: string,
): EntityClassificationClaim {
  const confidenceMap: Record<EntityResolutionSource, EntityClassificationClaim['confidence']> = {
    url_hint: 'url_hint',
    user_manual: 'manual',
    mock_registry: 'cached',
    tribe_registry: 'cached',
    maintainer_registry: 'indexed',
    owner_claim_verified: 'onchain_verified',
    dappkit_current_object: 'indexed',
    world_api: 'cached',
    indexed: 'indexed',
    onchain_verified: 'onchain_verified',
    unknown: 'unknown',
  };

  return {
    id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entityKey,
    claimedType: type,
    source,
    confidence: confidenceMap[source],
    priority: SOURCE_PRIORITY[source],
    label,
    evidence,
    createdAt: new Date().toISOString(),
  };
}
