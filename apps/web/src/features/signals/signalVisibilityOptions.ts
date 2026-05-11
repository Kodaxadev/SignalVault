import type { ViewerContext } from '@/features/viewer';
import type { SignalVisibility } from '@/features/signals/signalTypes';
import { evaluateCreateTribeScope } from '@/features/tribeVault/tribePolicy';

const visibilityLabels: Record<SignalVisibility, string> = {
  local_private: 'Local',
  private: 'Private',
  public: 'Public',
  tribe: 'Tribe',
  officer: 'Officer',
  scout_cell: 'Scout Cell',
};

export interface VisibilityOption {
  visibility: SignalVisibility;
  label: string;
  available: boolean;
  reason?: string;
}

export function getAvailableSignalVisibilities(viewer: ViewerContext): VisibilityOption[] {
  if (viewer.state === 'anonymous') {
    return [{ visibility: 'local_private', label: visibilityLabels.local_private, available: true }];
  }

  const personalScopes: VisibilityOption[] = [
    { visibility: 'private', label: visibilityLabels.private, available: true },
    { visibility: 'public', label: visibilityLabels.public, available: true },
  ];

  if (viewer.state !== 'character_resolved') {
    return personalScopes;
  }

  // Character resolved - check tribe scopes
  const tribeResult = evaluateCreateTribeScope(viewer, 'tribe');
  const officerResult = evaluateCreateTribeScope(viewer, 'officer');
  const scoutResult = evaluateCreateTribeScope(viewer, 'scout_cell');

  return [
    ...personalScopes,
    {
      visibility: 'tribe',
      label: visibilityLabels.tribe,
      available: tribeResult.allowed,
      reason: tribeResult.allowed ? undefined : tribeResult.reason,
    },
    {
      visibility: 'officer',
      label: visibilityLabels.officer,
      available: officerResult.allowed,
      reason: officerResult.allowed ? undefined : officerResult.reason,
    },
    {
      visibility: 'scout_cell',
      label: visibilityLabels.scout_cell,
      available: scoutResult.allowed,
      reason: scoutResult.allowed ? undefined : scoutResult.reason,
    },
  ];
}
