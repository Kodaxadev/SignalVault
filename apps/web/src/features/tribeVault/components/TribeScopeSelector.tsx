import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility } from '@/features/signals/signalTypes';
import { getAvailableSignalVisibilities, type VisibilityOption } from '@/features/signals/signalVisibilityOptions';

export function TribeScopeSelector({
  viewer,
  selectedVisibility,
  onChange,
}: {
  viewer: ViewerContext;
  selectedVisibility: SignalVisibility;
  onChange: (visibility: SignalVisibility) => void;
}) {
  const options = getAvailableSignalVisibilities(viewer);

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-400">VISIBILITY</label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <VisibilityOptionButton
            key={opt.visibility}
            option={opt}
            selected={opt.visibility === selectedVisibility}
            onClick={() => opt.available && onChange(opt.visibility)}
          />
        ))}
      </div>
    </div>
  );
}

function VisibilityOptionButton({
  option,
  selected,
  onClick,
}: {
  option: VisibilityOption;
  selected: boolean;
  onClick: () => void;
}) {
  const baseClasses = 'rounded px-2 py-1 text-xs font-medium transition-colors';
  const stateClasses = option.available
    ? selected
      ? 'bg-blue-700 text-white'
      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer'
    : 'bg-gray-900 text-gray-600 cursor-not-allowed';

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      disabled={!option.available}
      title={option.reason}
    >
      {option.label}{!option.available && ' (locked)'}
    </button>
  );
}
