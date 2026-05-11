import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility, SignalAuthor } from '@/features/signals/signalTypes';
import { evaluateReadTribeScope } from '@/features/tribeVault/tribePolicy';
import type { TribeScopeLevel } from '@/features/tribeVault/tribeScopeTypes';

export interface SignalStub {
  visibility: SignalVisibility;
  author: SignalAuthor;
}

export function canReadSignal(viewer: ViewerContext, signal: SignalStub): boolean {
  if (signal.visibility === 'public') return true;

  if (viewer.state === 'anonymous') {
    return (
      signal.visibility === 'local_private' &&
      signal.author.kind === 'anonymous_local'
    );
  }

  if (signal.visibility === 'private') {
    return (
      signal.author.kind !== 'anonymous_local' &&
      signal.author.walletAddress === viewer.walletAddress
    );
  }

  // Delegate to tribe policy for tribe scopes
  if (['tribe', 'officer', 'scout_cell'].includes(signal.visibility)) {
    const signalTribeId = signal.author.tribeId;
    if (!signalTribeId) return false;
    const result = evaluateReadTribeScope(viewer, signal.visibility as TribeScopeLevel, signalTribeId);
    return result.allowed;
  }

  return false;
}
