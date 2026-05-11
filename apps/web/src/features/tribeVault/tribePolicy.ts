import type { ViewerContext } from '@/features/viewer';
import type { TribeScopeLevel } from './tribeScopeTypes';
import type { TribePolicyResult, TribePolicyDenialReason } from './tribePolicyResults';
import type { TribeIdentity } from './tribeVaultTypes';

export function resolveTribeIdentity(viewer: ViewerContext): TribeIdentity | null {
  if (viewer.state !== 'character_resolved' || !viewer.tribeId) return null;
  return {
    tribeId: viewer.tribeId,
    tribeName: viewer.tribeName ?? 'Unknown Tribe',
    roles: (viewer.roles as TribeIdentity['roles']) ?? [],
  };
}

export function getAvailableTribeScopes(viewer: ViewerContext): TribeScopeLevel[] {
  const identity = resolveTribeIdentity(viewer);
  if (!identity) return [];

  const scopes: TribeScopeLevel[] = ['tribe'];

  if (identity.roles.includes('officer')) {
    scopes.push('officer');
  }

  // scout_cell locked in 09A unless cell identity exists
  // No cell identity model yet, so always locked even with scout role

  return scopes;
}

function lockedScopes(viewer: ViewerContext): { scope: TribeScopeLevel; reason: TribePolicyDenialReason }[] {
  const identity = resolveTribeIdentity(viewer);
  const locked: { scope: TribeScopeLevel; reason: TribePolicyDenialReason }[] = [];

  if (!identity) {
    locked.push({ scope: 'tribe', reason: 'tribe_missing' });
    locked.push({ scope: 'officer', reason: 'tribe_missing' });
    locked.push({ scope: 'scout_cell', reason: 'tribe_missing' });
    return locked;
  }

  if (!identity.roles.includes('officer')) {
    locked.push({ scope: 'officer', reason: identity.roles.length === 0 ? 'scout_role_missing' : 'officer_role_missing' });
  }

  locked.push({ scope: 'scout_cell', reason: 'cell_identity_missing' });

  return locked;
}

export function evaluateCreateTribeScope(viewer: ViewerContext, scope: TribeScopeLevel): TribePolicyResult {
  if (viewer.state !== 'character_resolved') {
    return { allowed: false, reason: 'not_character_resolved' };
  }

  if (!viewer.tribeId) {
    return { allowed: false, reason: 'tribe_missing' };
  }

  switch (scope) {
    case 'tribe':
      return { allowed: true };
    case 'officer':
      return viewer.roles.includes('officer')
        ? { allowed: true }
        : { allowed: false, reason: 'officer_role_missing' };
    case 'scout_cell':
      return { allowed: false, reason: 'cell_identity_missing' };
  }
}

export function evaluateReadTribeScope(
  viewer: ViewerContext,
  scope: TribeScopeLevel,
  signalTribeId: string,
): TribePolicyResult {
  if (viewer.state !== 'character_resolved') {
    return { allowed: false, reason: 'not_character_resolved' };
  }

  if (!viewer.tribeId) {
    return { allowed: false, reason: 'tribe_missing' };
  }

  if (viewer.tribeId !== signalTribeId) {
    return { allowed: false, reason: 'tribe_mismatch' };
  }

  switch (scope) {
    case 'tribe':
      return { allowed: true };
    case 'officer':
      return viewer.roles.includes('officer')
        ? { allowed: true }
        : { allowed: false, reason: 'officer_role_missing' };
    case 'scout_cell':
      return { allowed: false, reason: 'cell_identity_missing' };
  }
}

export function evaluateExportTribeScope(
  viewer: ViewerContext,
  scope: TribeScopeLevel,
  signalTribeId: string,
): TribePolicyResult {
  return evaluateReadTribeScope(viewer, scope, signalTribeId);
}

export { lockedScopes as getLockedTribeScopes };
