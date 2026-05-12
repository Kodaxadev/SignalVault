import type { ResolvedEntity } from '@/features/entities';
import { EntityResolutionBadge } from '@/features/entities';
import { TerminalPanel } from '@/features/ingame';

const typeLabels: Record<ResolvedEntity['type'], string> = {
  smart_gate: 'Smart Gate',
  smart_storage_unit: 'Storage Unit',
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

export function DossierHeader({ entity, officialLabel }: { entity: ResolvedEntity; officialLabel?: string }) {
  return (
    <TerminalPanel title={`SIGNAL VAULT // ${typeLabels[entity.type].toUpperCase()}`} code={`ROOT / ${entity.confidence}`}>
      <p className="font-mono text-xs uppercase text-zinc-300">
        {entity.label}
        {officialLabel && officialLabel !== entity.label && (
          <span className="text-zinc-500"> / Official: {officialLabel}</span>
        )}
      </p>
      <div className="mt-2">
        <EntityResolutionBadge confidence={entity.confidence} />
      </div>
      <dl className="mt-3 grid gap-1 font-mono text-xs uppercase text-zinc-500 sm:grid-cols-[120px_minmax(0,1fr)]">
        {entity.objectId && (
          <>
            <dt>Object ID</dt>
            <dd className="break-all text-zinc-300">{entity.objectId}</dd>
          </>
        )}
        {entity.tenant && (
          <>
            <dt>Tenant</dt>
            <dd className="text-zinc-300">{entity.tenant}</dd>
          </>
        )}
        {entity.itemId && (
          <>
            <dt>Item ID</dt>
            <dd className="break-all text-zinc-300">{entity.itemId}</dd>
          </>
        )}
      </dl>
    </TerminalPanel>
  );
}
