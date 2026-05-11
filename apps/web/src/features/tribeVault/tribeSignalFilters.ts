import type { Signal } from '@/features/signals/signalTypes';
import type { ViewerContext } from '@/features/viewer';
import type { TribeScopeLevel } from './tribeScopeTypes';
import { evaluateReadTribeScope } from './tribePolicy';

export function filterSignalsByTribeScope(
  signals: Signal[],
  viewer: ViewerContext,
  scope: TribeScopeLevel,
): Signal[] {
  return signals.filter((signal) => {
    const signalTribeId = signal.author.tribeId;
    if (!signalTribeId) return false;

    const result = evaluateReadTribeScope(viewer, scope, signalTribeId);
    return result.allowed;
  });
}

export function getTribeScopedSignals(
  signals: Signal[],
  viewer: ViewerContext,
): Signal[] {
  return signals.filter((signal) => {
    const signalVisibility = signal.visibility;
    if (!['tribe', 'officer', 'scout_cell'].includes(signalVisibility)) return false;

    const signalTribeId = signal.author.tribeId;
    if (!signalTribeId) return false;

    const scope = signalVisibility as TribeScopeLevel;
    const result = evaluateReadTribeScope(viewer, scope, signalTribeId);
    return result.allowed;
  });
}
