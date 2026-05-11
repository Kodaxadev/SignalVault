import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility } from '@/features/signals/signalTypes';
import { TribeScopeSelector } from '@/features/tribeVault/components/TribeScopeSelector';

export function SignalVisibilitySelector({
  viewer,
  selectedVisibility,
  onChange,
}: {
  viewer: ViewerContext;
  selectedVisibility: SignalVisibility;
  onChange: (visibility: SignalVisibility) => void;
}) {
  return (
    <TribeScopeSelector
      viewer={viewer}
      selectedVisibility={selectedVisibility}
      onChange={onChange}
    />
  );
}
