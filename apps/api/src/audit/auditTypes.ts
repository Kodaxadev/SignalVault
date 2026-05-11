import type { ServerIdentitySource } from '../auth/authTypes';

export type { ServerIdentitySource };

export type AuditEventType =
  | 'signal_created'
  | 'signal_updated'
  | 'signal_deleted'
  | 'signal_exported'
  | 'visibility_changed';

export type AuditOutcome = 'success' | 'denied';

export interface ServerAuditEvent {
  id: string;
  eventType: AuditEventType;
  actorCharacterId?: string;
  actorWalletAddress: string;
  actorTribeId?: string;
  actorRoleSnapshot: Record<string, unknown>;
  targetSignalId: string;
  oldVisibility?: string;
  newVisibility?: string;
  outcome: AuditOutcome;
  denialReason?: string;
  requestId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  /** How server-side character identity was derived for this event. */
  identitySource?: ServerIdentitySource;
}

export type AuditEventInput = Omit<ServerAuditEvent, 'id' | 'createdAt'>;
