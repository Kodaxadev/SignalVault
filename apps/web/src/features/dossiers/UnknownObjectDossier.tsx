import type { ResolvedEntity } from '@/features/entities';
import { EntityResolutionBadge } from '@/features/entities';
import { ClassificationSourceList } from '@/features/entities';
import { ClassificationConflictBanner } from '@/features/entities';
import { ManualClassificationPanel } from '@/features/entities';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { ObjectUnresolved, ManualClassificationNote } from '@/features/ingame';
import { WorldApiTypePanel } from '@/features/worldApi/components/WorldApiTypePanel';

export function UnknownObjectDossier({
  resolved,
  onSignalCreated,
}: {
  resolved: ResolvedEntity;
  onSignalCreated?: (message: string) => void;
}) {
  const isUnknown = resolved.type === 'unknown';
  const isConflicted = resolved.confidence === 'conflicted';

  return (
    <div className="space-y-4">
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h2 className="text-sm font-semibold text-gray-200">
          {isUnknown ? 'Unknown Object' : `${resolved.label}`}
        </h2>
        {isUnknown && resolved.sourceClaims.length === 0 && (
          <ObjectUnresolved />
        )}
        {isUnknown && resolved.sourceClaims.length > 0 && (
          <ObjectUnresolved />
        )}
        {isConflicted && (
          <p className="mt-1 text-xs text-red-400">
            Sources disagree about this object. Recheck before relying on this dossier.
          </p>
        )}
        {!isUnknown && !isConflicted && (
          <p className="mt-1 text-xs text-gray-400">
            {resolved.confidence === 'manual'
              ? 'Manually classified. Not yet verified by stronger data sources.'
              : `Classification from ${resolved.sources.join(', ')}.`}
          </p>
        )}
        <div className="mt-2">
          <EntityResolutionBadge confidence={resolved.confidence} />
        </div>
        <dl className="mt-3 space-y-1 text-xs text-gray-500">
          {resolved.objectId && (
            <>
              <dt>Object ID</dt>
              <dd className="text-gray-300 font-mono">{resolved.objectId}</dd>
            </>
          )}
          {resolved.tenant && (
            <>
              <dt>Tenant</dt>
              <dd className="text-gray-300">{resolved.tenant}</dd>
            </>
          )}
          {resolved.itemId && (
            <>
              <dt>Item ID</dt>
              <dd className="text-gray-300 font-mono">{resolved.itemId}</dd>
            </>
          )}
        </dl>
      </div>

      <ClassificationSourceList claims={resolved.sourceClaims} />
      <ClassificationConflictBanner conflictingClaims={[]} />

      {isUnknown && (
        <ManualClassificationPanel entityKey={resolved.entityKey} />
      )}
      {isUnknown && <ManualClassificationNote />}

      {resolved.itemId && <WorldApiTypePanel typeId={resolved.itemId} />}

      <QuickSignalButtons entityType={resolved.type} resolvedEntity={resolved} onSignalCreated={onSignalCreated} />
      <SignalList entityKey={resolved.entityKey} />
    </div>
  );
}
