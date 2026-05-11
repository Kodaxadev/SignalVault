import type { ViewerContext } from '@/features/viewer';
import type { TribeIdentity } from './tribeVaultTypes';
import type { TribeScopeLevel } from './tribeScopeTypes';
import { resolveTribeIdentity, getAvailableTribeScopes, getLockedTribeScopes } from './tribePolicy';

export type TribeVaultReadiness =
  | {
      ready: false;
      reason: 'not_character_resolved' | 'tribe_missing';
      missingPieces: string[];
      availableScopes: [];
    }
  | {
      ready: true;
      identity: TribeIdentity;
      availableScopes: TribeScopeLevel[];
      lockedScopes: { scope: TribeScopeLevel; reason: string }[];
      warnings: string[];
    };

export function checkTribeVaultReadiness(viewer: ViewerContext): TribeVaultReadiness {
  if (viewer.state !== 'character_resolved') {
    return {
      ready: false,
      reason: 'not_character_resolved',
      missingPieces: ['Character identity not resolved. Connect wallet and resolve character first.'],
      availableScopes: [],
    };
  }

  const identity = resolveTribeIdentity(viewer);
  if (!identity) {
    return {
      ready: false,
      reason: 'tribe_missing',
      missingPieces: ['Character resolved but no tribe detected. Tribe membership required for vault access.'],
      availableScopes: [],
    };
  }

  const availableScopes = getAvailableTribeScopes(viewer);
  const locked = getLockedTribeScopes(viewer);
  const warnings: string[] = [];

  if (identity.roles.length === 0) {
    warnings.push('No elevated roles detected. Officer/scout scopes locked.');
  }

  if (locked.some((l) => l.scope === 'scout_cell')) {
    warnings.push('Scout cell scope unavailable: cell identity not configured.');
  }

  return {
    ready: true,
    identity,
    availableScopes,
    lockedScopes: locked.map((l) => ({ scope: l.scope, reason: l.reason })),
    warnings,
  };
}
