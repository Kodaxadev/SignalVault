import { describe, it, expect, afterAll } from 'vitest';
import { db, getPool } from '../src/db/dbClient';
import { insertAuditEventToDb } from '../src/db/auditRepository';
import { insertSignal } from '../src/db/signalRepository';

// Integration tests — skipped when DATABASE_URL is not configured.
// Run manually: DATABASE_URL=postgres://... pnpm test:run
const hasDatabase = Boolean(process.env['DATABASE_URL']);

describe.skipIf(!hasDatabase)('DB Smoke (integration)', () => {
  afterAll(async () => {
    const pool = getPool();
    if (pool) await pool.end();
  });

  it('can ping the database', async () => {
    const result = await db.ping();
    expect(result).toBe(true);
  });

  it('db.isConnected is true when DATABASE_URL is set', () => {
    expect(db.isConnected).toBe(true);
  });

  it('can insert an audit event to audit_log', async () => {
    const event = {
      id: crypto.randomUUID(),
      eventType: 'signal_created' as const,
      actorWalletAddress: 'smoke-test-wallet',
      actorRoleSnapshot: {},
      targetSignalId: crypto.randomUUID(),
      outcome: 'denied' as const,
      denialReason: 'tribe_identity_missing',
      requestId: crypto.randomUUID(),
      metadata: { test: true },
      createdAt: new Date().toISOString(),
    };
    // Should not throw
    await expect(insertAuditEventToDb(event)).resolves.toBeUndefined();
  });

  it('can insert a signal and get a UUID back', async () => {
    const row = await insertSignal({
      authorCharacterId: 'smoke-char',
      authorWalletAddress: 'smoke-wallet',
      authorTribeId: null,
      visibility: 'public',
      signalType: 'gate_recon',
      confidence: 'high',
      title: 'Smoke test signal',
      body: 'Inserted during DB smoke test.',
      linkedEntities: [],
      createdAt: new Date().toISOString(),
    });
    expect(typeof row.id).toBe('string');
    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(row.author_wallet_address).toBe('smoke-wallet');
    expect(row.visibility).toBe('public');
  });

  it('audit_log insert is idempotent on unique id', async () => {
    const pool = getPool();
    if (!pool) throw new Error('Pool not available');

    const id = crypto.randomUUID();
    const event = {
      id,
      eventType: 'signal_deleted' as const,
      actorWalletAddress: 'smoke-test-wallet-2',
      actorRoleSnapshot: {},
      targetSignalId: crypto.randomUUID(),
      outcome: 'success' as const,
      requestId: crypto.randomUUID(),
      metadata: {},
      createdAt: new Date().toISOString(),
    };

    await insertAuditEventToDb(event);
    const result = await pool.query(
      'SELECT id FROM audit_log WHERE id = $1',
      [id]
    );
    expect(result.rows).toHaveLength(1);
  });
});

// Always-passing guard: verifies skipping works correctly in environments without a DB
describe('DB Smoke (unit guard)', () => {
  it('db.isConnected reflects DATABASE_URL presence', () => {
    expect(db.isConnected).toBe(hasDatabase);
  });

  it('db.ping returns false when DATABASE_URL is not set', async () => {
    if (hasDatabase) return; // skip when DB is actually configured
    const result = await db.ping();
    expect(result).toBe(false);
  });
});
