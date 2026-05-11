import { useState } from 'react';
import type { EntityType } from '@/features/entities';
import { useEntityResolution } from '@/features/entities/EntityResolutionProvider';

const CLASSIFIABLE_TYPES: EntityType[] = [
  'smart_gate',
  'smart_storage_unit',
  'smart_turret',
  'network_node',
  'market',
  'system',
  'route',
  'item',
  'unknown',
];

const TYPE_LABELS: Record<EntityType, string> = {
  smart_gate: 'Smart Gate',
  smart_storage_unit: 'Smart Storage Unit',
  smart_turret: 'Smart Turret',
  network_node: 'Network Node',
  character: 'Character',
  tribe: 'Tribe',
  system: 'System',
  route: 'Route',
  market: 'Market',
  item: 'Item',
  unknown: 'Unknown',
};

export function ManualClassificationPanel({
  entityKey,
  onClassified,
}: {
  entityKey: string;
  onClassified?: () => void;
}) {
  const { classify } = useEntityResolution();
  const [selected, setSelected] = useState<EntityType | ''>('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    classify({
      entityKey,
      type: selected,
      label: TYPE_LABELS[selected],
    });
    setConfirmed(true);
    onClassified?.();
  };

  if (confirmed) {
    return (
      <div className="rounded border border-green-700 bg-green-900/30 p-3 text-xs">
        <p className="text-green-300">
          Object classified as <span className="font-semibold">{selected && TYPE_LABELS[selected]}</span>.
        </p>
        <p className="mt-1 text-gray-400">
          Resolution: Manual — not yet verified by stronger data sources.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-sm font-semibold text-gray-200 mb-2">Classify Object</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as EntityType)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-100 focus:border-gray-500 focus:outline-none"
          data-testid="entity-type-select"
        >
          <option value="">Select type...</option>
          {CLASSIFIABLE_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!selected}
          className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Classify
        </button>
      </form>
      <p className="mt-2 text-xs text-gray-500">
        Manual classification is useful but not verified. It will be visibly labeled.
      </p>
    </div>
  );
}
