import type { ViewerContext } from '@/features/viewer';
import type { ResolvedEntity } from '@/features/entities';
import { canCreateSignal } from '@/features/permissions';
import type { QuickSignalAction } from '@/features/signals/quickActionTypes';
import type { Signal } from '@/features/signals/signalTypes';
import { PermissionDeniedError } from '@/features/signals/signalErrors';
import { createEntitySnapshot } from '@/features/signals/signalContextSnapshot';
import { getDefaultSignalVisibility } from '@/features/signals/signalVisibilityDefaults';

export function createSignalDraft(input: {
  viewer: ViewerContext;
  resolvedEntity: ResolvedEntity;
  action: QuickSignalAction;
  surface: 'ingame_object' | 'ingame_capture' | 'external_app';
  visibility?: Signal['visibility'];
  now?: Date;
}): Signal {
  const visibility = input.visibility ?? getDefaultSignalVisibility(input.viewer);

  if (!canCreateSignal(input.viewer, visibility)) {
    throw new PermissionDeniedError(
      visibility,
      input.viewer.state,
      `Cannot create signal with visibility "${visibility}" for ${input.viewer.state} viewer.`,
    );
  }

  const author = buildAuthor(input.viewer);
  const now = input.now ?? new Date();
  const nowStr = now.toISOString();

  return {
    id: `signal-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.action.label,
    body: '',
    signalType: input.action.signalType,
    confidence: input.action.defaultConfidence,
    visibility,
    syncState: 'local_only',
    author,
    linkedEntities: createEntitySnapshot(input.resolvedEntity),
    createdInContext: {
      surface: input.surface,
      tenant: input.resolvedEntity.tenant,
      itemId: input.resolvedEntity.itemId,
      objectId: input.resolvedEntity.objectId,
      viewerState: input.viewer.state,
    },
    tags: [],
    createdAt: nowStr,
    updatedAt: nowStr,
  };
}

function buildAuthor(viewer: ViewerContext): Signal['author'] {
  if (viewer.state === 'anonymous') {
    return { kind: 'anonymous_local' };
  }
  if (viewer.state === 'wallet_connected') {
    return { kind: 'wallet', walletAddress: viewer.walletAddress };
  }
  return {
    kind: 'character',
    walletAddress: viewer.walletAddress,
    characterId: viewer.characterId,
    characterName: viewer.characterName,
    tribeId: viewer.tribeId,
  };
}
