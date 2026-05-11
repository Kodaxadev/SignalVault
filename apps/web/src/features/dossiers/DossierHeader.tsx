import type { ResolvedEntity } from '@/features/entities';
import { EntityResolutionBadge } from '@/features/entities';

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
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h2 className="text-sm font-semibold text-gray-200">
        SIGNAL VAULT // {typeLabels[entity.type].toUpperCase()}
      </h2>
      <p className="mt-1 text-xs text-gray-400">
        {entity.label}
        {officialLabel && officialLabel !== entity.label && (
          <span className="text-gray-500"> (Official: {officialLabel})</span>
        )}
      </p>
      <div className="mt-2">
        <EntityResolutionBadge confidence={entity.confidence} />
      </div>
      <dl className="mt-3 space-y-1 text-xs text-gray-500">
        {entity.objectId && (
          <>
            <dt>Object ID</dt>
            <dd className="text-gray-300 font-mono">{entity.objectId}</dd>
          </>
        )}
        {entity.tenant && (
          <>
            <dt>Tenant</dt>
            <dd className="text-gray-300">{entity.tenant}</dd>
          </>
        )}
        {entity.itemId && (
          <>
            <dt>Item ID</dt>
            <dd className="text-gray-300 font-mono">{entity.itemId}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
