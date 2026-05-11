import type { ResolvedEntity } from '@/features/entities';
import { EntityResolutionBadge } from '@/features/entities';
import { ClassificationSourceList } from '@/features/entities';
import { ClassificationConflictBanner } from '@/features/entities';
import { ObjectUnresolved } from './InGameEmptyStates';

const typeLabels: Record<ResolvedEntity['type'], string> = {
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
  unknown: 'Unknown Object',
};

export function InGameObjectContextPanel({ entity }: { entity: ResolvedEntity }) {
  const isUnknown = entity.type === 'unknown';
  const isConflicted = entity.confidence === 'conflicted';

  return (
    <div className="space-y-4">
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h2 className="text-sm font-semibold text-gray-200">
          {typeLabels[entity.type]}
        </h2>
        {isUnknown && entity.sourceClaims.length === 0 && (
          <ObjectUnresolved />
        )}
        {isConflicted && (
          <p className="mt-1 text-xs text-red-400">
            Sources disagree about this object. Recheck before relying on this dossier.
          </p>
        )}
        {!isUnknown && !isConflicted && (
          <p className="mt-1 text-xs text-gray-400">
            {entity.confidence === 'manual'
              ? 'Manually classified. Not yet verified by stronger data sources.'
              : `Classification from ${entity.sources.join(', ')}.`}
          </p>
        )}
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

      <ClassificationSourceList claims={entity.sourceClaims} />
      <ClassificationConflictBanner conflictingClaims={[]} />
    </div>
  );
}
