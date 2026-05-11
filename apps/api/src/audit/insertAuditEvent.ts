import type { AuditEventInput, ServerAuditEvent } from './auditTypes';
import { insertAuditEventToDb } from '../db/auditRepository';
import { db } from '../db/dbClient';

// Audit log is append-only. If DB is connected, inserts to audit_log table.
// Falls back to console.log when DB is not configured (dev/test without DB).
export async function insertAuditEvent(input: AuditEventInput): Promise<ServerAuditEvent> {
  const event: ServerAuditEvent = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (db.isConnected) {
    await insertAuditEventToDb(event);
  } else {
    console.log('[audit]', event.eventType, event.outcome, event.requestId);
  }

  return event;
}
