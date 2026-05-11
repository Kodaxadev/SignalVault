import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility } from '@/features/signals/signalTypes';

export function getDefaultSignalVisibility(viewer: ViewerContext): SignalVisibility {
  if (viewer.state === 'anonymous') return 'local_private';
  return 'private';
}
