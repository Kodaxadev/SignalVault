import { useState } from 'react';
import type { EntityType } from '@/features/entities';
import { useEntityResolution } from '@/features/entities/EntityResolutionProvider';
import { TerminalButton, TerminalPanel, TerminalStatusStrip } from '@/features/ingame/TerminalFrame';

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
      <TerminalPanel title="Classify Object" code="MANUAL" headingLevel={3}>
        <TerminalStatusStrip tone="success">
          Object classified as <span className="font-semibold">{selected && TYPE_LABELS[selected]}</span>.
        </TerminalStatusStrip>
        <p className="mt-2 font-mono text-xs uppercase text-zinc-500">
          Resolution: Manual - not yet verified by stronger data sources.
        </p>
      </TerminalPanel>
    );
  }

  return (
    <TerminalPanel title="Classify Object" code="MANUAL" headingLevel={3}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as EntityType)}
          className="w-full border border-zinc-700 bg-black px-3 py-2 font-mono text-xs uppercase text-zinc-100 focus:border-orange-500 focus:outline-none"
          data-testid="entity-type-select"
        >
          <option value="">Select type...</option>
          {CLASSIFIABLE_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <TerminalButton type="submit" tone="primary" disabled={!selected}>Classify</TerminalButton>
      </form>
      <p className="mt-2 font-mono text-xs uppercase text-zinc-500">
        Manual classification is useful but not verified. It will be visibly labeled.
      </p>
    </TerminalPanel>
  );
}
