import type { Signal } from '@/features/signals/signalTypes';

const tribeScopeLabels: Record<string, string> = {
  tribe: 'Tribe',
  officer: 'Officer',
  scout_cell: 'Scout Cell',
};

const tribeScopeColors: Record<string, string> = {
  tribe: 'bg-purple-800 text-purple-300',
  officer: 'bg-amber-800 text-amber-300',
  scout_cell: 'bg-cyan-800 text-cyan-300',
};

export function TribeSignalScopeBadge({ signal }: { signal: Signal }) {
  const scope = signal.visibility;
  if (!['tribe', 'officer', 'scout_cell'].includes(scope)) return null;

  const label = tribeScopeLabels[scope] ?? scope;
  const color = tribeScopeColors[scope] ?? 'bg-gray-800 text-gray-400';
  const tribeName = signal.author.tribeId ? ` · ${signal.author.tribeId.slice(0, 12)}…` : '';

  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}{tribeName}
    </span>
  );
}
