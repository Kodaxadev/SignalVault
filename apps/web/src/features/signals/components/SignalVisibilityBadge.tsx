import type { SignalVisibility } from '@/features/signals/signalTypes';

const visibilityLabels: Record<SignalVisibility, string> = {
  local_private: 'Local',
  private: 'Private',
  tribe: 'Tribe',
  officer: 'Officer',
  scout_cell: 'Scout Cell',
  public: 'Public',
};

const visibilityColors: Record<SignalVisibility, string> = {
  local_private: 'bg-gray-800 text-gray-400',
  private: 'bg-blue-800 text-blue-300',
  tribe: 'bg-purple-800 text-purple-300',
  officer: 'bg-amber-800 text-amber-300',
  scout_cell: 'bg-cyan-800 text-cyan-300',
  public: 'bg-green-800 text-green-300',
};

export function SignalVisibilityBadge({ visibility }: { visibility: SignalVisibility }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${visibilityColors[visibility]}`}
    >
      {visibilityLabels[visibility]}
    </span>
  );
}
