import type { Signal } from '@/features/signals/signalTypes';

export type RemoteSignalVisibility = 'tribe' | 'officer' | 'scout_cell' | 'public' | 'private';

export interface CreateRemoteSignalPayload {
  visibility: RemoteSignalVisibility;
  signalType: string;
  confidence: string;
  title: string;
  body: string;
  linkedEntities: unknown[];
  createdAt: string;
  expiresAt?: string;
}

export interface RemoteSignal extends CreateRemoteSignalPayload {
  id: string;
  authorCharacterId?: string;
  authorWalletAddress: string;
  authorTribeId?: string;
  createdAt: string;
  updatedAt: string;
}

export function signalToRemotePayload(signal: Signal): CreateRemoteSignalPayload | null {
  if (signal.visibility === 'local_private') return null;
  if (signal.author.kind === 'anonymous_local') return null;

  return {
    visibility: signal.visibility as RemoteSignalVisibility,
    signalType: signal.signalType,
    confidence: signal.confidence,
    title: signal.title,
    body: signal.body,
    linkedEntities: signal.linkedEntities,
    createdAt: signal.createdAt,
    expiresAt: signal.expiresAt,
  };
}

export function isRemoteVisibility(visibility: string): visibility is RemoteSignalVisibility {
  return ['tribe', 'officer', 'scout_cell', 'public', 'private'].includes(visibility);
}
