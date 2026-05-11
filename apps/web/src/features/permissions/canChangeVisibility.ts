import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility } from '@/features/signals/signalTypes';
import type { SignalStub } from './canReadSignal';

export function canChangeVisibility(
  viewer: ViewerContext,
  signal: SignalStub,
  _newVisibility: SignalVisibility,
): boolean {
  if (signal.author.kind === 'anonymous_local') return false;

  if (signal.author.walletAddress === viewer.walletAddress) {
    return true;
  }

  if (viewer.state !== 'character_resolved') return false;

  return viewer.roles.includes('officer');
}
