import type { EntityType } from './entityTypes';
import type { EntityClassificationClaim, EntityResolutionSource } from './entityClassificationTypes';

export type ResolvedEntity = {
  entityKey: string;
  entityId: string;
  tenant?: string;
  itemId?: string;
  typeId?: string;
  objectId?: string;
  type: EntityType;
  label: string;
  confidence: 'url_hint' | 'manual' | 'cached' | 'indexed' | 'onchain_verified' | 'conflicted' | 'unknown';
  sources: EntityResolutionSource[];
  sourceClaims: EntityClassificationClaim[];
  raw?: unknown;
  updatedAt: string;
};

export type ResolutionCandidate = {
  type: EntityType;
  source: EntityResolutionSource;
  label?: string;
  claim?: EntityClassificationClaim;
};

export type ResolutionMergeResult = {
  type: EntityType;
  confidence: ResolvedEntity['confidence'];
  winningCandidate: ResolutionCandidate | null;
  allClaims: EntityClassificationClaim[];
  conflictingClaims: EntityClassificationClaim[];
};
