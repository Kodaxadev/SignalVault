import type { ResolvedEntity } from '@/features/entities';
import { EntityResolutionBadge } from '@/features/entities';
import { ClassificationSourceList } from '@/features/entities';
import { ClassificationConflictBanner } from '@/features/entities';
import { ManualClassificationPanel } from '@/features/entities';
import { QuickSignalButtons } from '@/features/signals/components/QuickSignalButtons';
import { SignalList } from '@/features/signals/components/SignalList';
import { ObjectUnresolved, ManualClassificationNote, TerminalPanel } from '@/features/ingame';
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
      <TerminalPanel title={isUnknown ? 'Unknown Object' : resolved.label} code={`ROOT / ${resolved.confidence}`}>
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
          <p className="mt-1 text-xs text-zinc-400">
            {resolved.confidence === 'manual'
              ? 'Manually classified. Not yet verified by stronger data sources.'
              : `Classification from ${resolved.sources.join(', ')}.`}
          </p>
        )}
        <div className="mt-2">
          <EntityResolutionBadge confidence={resolved.confidence} />
        </div>
        <dl className="mt-3 grid gap-1 font-mono text-xs uppercase text-zinc-500 sm:grid-cols-[120px_minmax(0,1fr)]">
          {resolved.objectId && (
            <>
              <dt>Object ID</dt>
              <dd className="break-all text-zinc-300">{resolved.objectId}</dd>
            </>
          )}
          {resolved.tenant && (
            <>
              <dt>Tenant</dt>
              <dd className="text-zinc-300">{resolved.tenant}</dd>
            </>
          )}
          {resolved.itemId && (
            <>
              <dt>Item ID</dt>
              <dd className="break-all text-zinc-300">{resolved.itemId}</dd>
            </>
          )}
        </dl>
      </TerminalPanel>

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
