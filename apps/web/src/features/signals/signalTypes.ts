import type { EntityType } from '@/features/entities';

export type SignalType =
  | 'field_note'
  | 'gate_recon'
  | 'storage_manifest'
  | 'route_report'
  | 'market_report'
  | 'system_report'
  | 'assembly_log'
  | 'hostile_contact'
  | 'permit_report'
  | 'access_denied'
  | 'resource_report'
  | 'after_action_report';

export type SignalConfidence =
  | 'unknown'
  | 'rumor'
  | 'observed'
  | 'corroborated'
  | 'verified'
  | 'stale'
  | 'contradicted';

export type SignalVisibility =
  | 'local_private'
  | 'private'
  | 'tribe'
  | 'officer'
  | 'scout_cell'
  | 'public';

export type SignalSyncState =
  | 'local_only'
  | 'draft'
  | 'remote_pending'
  | 'remote_saved'
  | 'sync_failed';

export type SignalAuthorKind = 'anonymous_local' | 'wallet' | 'character';

export interface SignalAuthor {
  kind: SignalAuthorKind;
  walletAddress?: string;
  characterId?: string;
  characterName?: string;
  tribeId?: string;
}

export interface LinkedEntity {
  entityId: string;
  type: EntityType;
  label: string;
  tenant?: string;
  itemId?: string;
  objectId?: string;
  resolutionConfidence: string;
}

export interface CreatedInContext {
  surface: 'ingame_object' | 'ingame_capture' | 'external_app';
  tenant?: string;
  itemId?: string;
  objectId?: string;
  viewerState: string;
}

export interface SignalRemoteMeta {
  remoteId?: string;
  lastAttemptAt?: string;
  lastError?: string;
}

export interface Signal {
  id: string;
  title: string;
  body: string;
  signalType: SignalType;
  confidence: SignalConfidence;
  visibility: SignalVisibility;
  syncState: SignalSyncState;
  author: SignalAuthor;
  linkedEntities: LinkedEntity[];
  createdInContext: CreatedInContext;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  remote?: SignalRemoteMeta;
}
