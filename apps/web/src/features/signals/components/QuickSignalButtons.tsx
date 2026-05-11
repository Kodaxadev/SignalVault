import type { EntityType, ResolvedEntity } from '@/features/entities';
import { useViewerSession } from '@/features/viewer';
import { useSignalContext } from '@/features/signals/SignalProvider';
import { createSignalDraft } from '@/features/signals/createSignalDraft';
import { getActionsForType } from '@/features/signals/quickActions';
import { PermissionDeniedError } from '@/features/signals/signalErrors';
import { SignalVisibilitySelector } from '@/features/signals/components/SignalVisibilitySelector';
import { getDefaultSignalVisibility } from '@/features/signals/signalVisibilityDefaults';
import type { SignalVisibility } from '@/features/signals/signalTypes';
import { useState } from 'react';

export function QuickSignalButtons({
  entityType,
  resolvedEntity,
  onSignalCreated,
}: {
  entityType: EntityType;
  resolvedEntity: ResolvedEntity;
  onSignalCreated?: (message: string) => void;
}) {
  const { viewer } = useViewerSession();
  const { addSignal } = useSignalContext();
  const [error, setError] = useState<string | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<SignalVisibility>(
    getDefaultSignalVisibility(viewer),
  );
  const actions = getActionsForType(entityType);

  if (actions.length === 0) return null;

  const handleClick = (actionId: string) => {
    setError(null);
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    try {
      const signal = createSignalDraft({
        viewer,
        resolvedEntity,
        action,
        surface: 'ingame_object',
        visibility: selectedVisibility,
      });
      addSignal(signal);
      onSignalCreated?.(action.label);
    } catch (err) {
      if (err instanceof PermissionDeniedError) {
        setError(
          `Cannot create signal as ${err.requestedVisibility}: ${getDenialReason(err.requestedVisibility, viewer)}`,
        );
      } else {
        setError('Failed to create signal.');
      }
    }
  };

  return (
    <div className="space-y-3">
      <SignalVisibilitySelector
        viewer={viewer}
        selectedVisibility={selectedVisibility}
        onChange={setSelectedVisibility}
      />
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleClick(action.id)}
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-700 active:bg-gray-600"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="rounded border border-yellow-800 bg-yellow-900/20 p-2">
          <p className="text-xs text-yellow-300">{error}</p>
        </div>
      )}
    </div>
  );
}

function getDenialReason(visibility: SignalVisibility, viewer: ReturnType<typeof useViewerSession>['viewer']): string {
  const reasonMap: Record<string, string> = {
    not_character_resolved: 'Character identity not resolved',
    tribe_missing: 'No tribe membership detected',
    officer_role_missing: 'Officer role required',
    scout_role_missing: 'Scout role required',
    cell_identity_missing: 'Cell identity not configured',
  };
  return reasonMap[visibility] ?? `identity: ${viewer.state === 'anonymous' ? 'Anonymous' : viewer.characterName ?? 'Connected'}`;
}
