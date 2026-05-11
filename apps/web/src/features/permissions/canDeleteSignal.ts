import type { ViewerContext } from '@/features/viewer';
import type { SignalStub } from './canReadSignal';

export function canDeleteSignal(
  viewer: ViewerContext,
  signal: SignalStub,
): boolean {
  if (signal.author.kind === 'anonymous_local') {
    return viewer.state === 'anonymous';
  }

  if (signal.author.walletAddress && signal.author.walletAddress === viewer.walletAddress) {
    return true;
  }

  if (viewer.state !== 'character_resolved') return false;

  if (['tribe', 'officer', 'scout_cell'].includes(signal.visibility)) {
    return viewer.roles.includes('officer');
  }

  return false;
}
