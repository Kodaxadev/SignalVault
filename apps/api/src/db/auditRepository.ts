import type { ServerAuditEvent } from '../audit/auditTypes';
import { getPool } from './dbClient';

const INSERT_SQL = `
  INSERT INTO audit_log (
    id, event_type, actor_character_id, actor_wallet_address,
    actor_tribe_id, actor_role_snapshot, target_signal_id,
    old_visibility, new_visibility, outcome, denial_reason,
    request_id, metadata, created_at, identity_source
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
`;

export function buildAuditInsertValues(event: ServerAuditEvent): unknown[] {
  return [
    event.id,                                    // $1  pos 0
    event.eventType,                             // $2  pos 1
    event.actorCharacterId ?? null,              // $3  pos 2
    event.actorWalletAddress,                    // $4  pos 3
    event.actorTribeId ?? null,                  // $5  pos 4
    JSON.stringify(event.actorRoleSnapshot),     // $6  pos 5
    event.targetSignalId,                        // $7  pos 6
    event.oldVisibility ?? null,                 // $8  pos 7
    event.newVisibility ?? null,                 // $9  pos 8
    event.outcome,                               // $10 pos 9
    event.denialReason ?? null,                  // $11 pos 10
    event.requestId,                             // $12 pos 11
    JSON.stringify(event.metadata),              // $13 pos 12
    event.createdAt,                             // $14 pos 13
    event.identitySource ?? null,                // $15 pos 14
  ];
}

export async function insertAuditEventToDb(event: ServerAuditEvent): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(INSERT_SQL, buildAuditInsertValues(event));
}
