import type { EntityType } from '@/features/entities';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { ResolutionMergeResult, ResolutionCandidate } from '@/features/entities/entityResolutionTypes';

export function mergeResolutionCandidates(
  claims: EntityClassificationClaim[],
): ResolutionMergeResult {
  if (claims.length === 0) {
    return {
      type: 'unknown',
      confidence: 'unknown',
      winningCandidate: null,
      allClaims: [],
      conflictingClaims: [],
    };
  }

  // Group claims by priority
  const byPriority = new Map<number, EntityClassificationClaim[]>();
  for (const claim of claims) {
    const existing = byPriority.get(claim.priority) ?? [];
    existing.push(claim);
    byPriority.set(claim.priority, existing);
  }

  // Find highest priority
  const maxPriority = Math.max(...byPriority.keys());
  const topClaims = byPriority.get(maxPriority)!;

  // Check for same-priority conflicts
  const uniqueTypes = new Set(topClaims.map((c) => c.claimedType));
  const isConflicted = uniqueTypes.size > 1;

  // Find conflicting claims (same priority, different types)
  const conflictingClaims: EntityClassificationClaim[] = isConflicted
    ? topClaims.filter((c) => c.claimedType !== topClaims[0]?.claimedType)
    : [];

  // Winner: highest priority, non-unknown type if possible
  let winner: EntityClassificationClaim | null = topClaims[0] ?? null;
  if (isConflicted) {
    winner = null; // No winner when conflicted
  }

  const resultType: EntityType = isConflicted
    ? 'unknown'
    : (winner?.claimedType ?? 'unknown');

  const resultConfidence = isConflicted
    ? 'conflicted'
    : (winner?.confidence ?? 'unknown');

  const winningCandidate: ResolutionCandidate | null = winner
    ? {
        type: winner.claimedType,
        source: winner.source,
        label: winner.label,
        claim: winner,
      }
    : null;

  return {
    type: resultType,
    confidence: resultConfidence,
    winningCandidate,
    allClaims: claims,
    conflictingClaims,
  };
}
