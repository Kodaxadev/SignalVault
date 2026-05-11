import type { ViewerContext } from '@/features/viewer';
import type { SignalStub } from './canReadSignal';
import { evaluateExportTribeScope } from '@/features/tribeVault/tribePolicy';
import type { TribeScopeLevel } from '@/features/tribeVault/tribeScopeTypes';

export function canExportSignal(
  viewer: ViewerContext,
  signal: SignalStub,
): boolean {
  if (signal.visibility === 'local_private') return true;

  if (signal.visibility === 'private') {
    return signal.author.walletAddress === viewer.walletAddress;
  }

  if (signal.visibility === 'public') {
    return signal.author.walletAddress === viewer.walletAddress;
  }

  // Delegate to tribe policy for tribe scopes
  if (['tribe', 'officer', 'scout_cell'].includes(signal.visibility)) {
    const signalTribeId = signal.author.tribeId;
    if (!signalTribeId) return false;
    const result = evaluateExportTribeScope(viewer, signal.visibility as TribeScopeLevel, signalTribeId);
    return result.allowed;
  }

  return false;
}
