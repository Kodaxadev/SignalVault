import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility } from '@/features/signals/signalTypes';
import { evaluateCreateTribeScope } from '@/features/tribeVault/tribePolicy';
import type { TribeScopeLevel } from '@/features/tribeVault/tribeScopeTypes';

export function canCreateSignal(
  viewer: ViewerContext,
  visibility: SignalVisibility,
): boolean {
  if (visibility === 'local_private') return true;

  if (viewer.state === 'anonymous') return false;

  if (visibility === 'private' || visibility === 'public') {
    return viewer.state === 'wallet_connected' || viewer.state === 'character_resolved';
  }

  // Delegate to tribe policy for tribe scopes
  if (['tribe', 'officer', 'scout_cell'].includes(visibility)) {
    const result = evaluateCreateTribeScope(viewer, visibility as TribeScopeLevel);
    return result.allowed;
  }

  return false;
}
