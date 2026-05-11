import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import type { SignalRecord, ClassificationRecord } from '@/features/local/localDbTypes';
import { importLocalData } from '@/features/local/localImport';
import { loadAllSignals, addSignal } from '@/features/local/localSignalRepository';
import { loadAllClassifications, addClassification } from '@/features/local/localEntityClassificationRepository';
import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { Signal } from '@/features/signals/signalTypes';

function makeTestDb() {
  const db = new Dexie('test-import');
  db.version(1).stores({
    signals: '&id, entityKey, createdAt',
    classifications: '&id, entityKey, createdAt',
  });
  return db;
}

function makeSignal(id: string): Signal {
  return {
    id,
    title: 'Test',
    body: '',
    signalType: 'field_note',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    linkedEntities: [{ entityId: `entity-${id}`, label: 'Test', type: 'unknown' as any, resolutionConfidence: 'unknown' }],
    confidence: 'unknown',
    author: { kind: 'anonymous_local' },
    visibility: 'local_private',
    syncState: 'local_only',
    createdInContext: { surface: 'external_app', viewerState: 'anonymous' },
    tags: [],
  };
}

function makeEnvelope(signals: Signal[], classifications: ReturnType<typeof createClaim>[]) {
  return {
    schemaVersion: 1,
    app: 'signal-vault' as const,
    exportedAt: '2025-01-01T00:00:00.000Z',
    signals,
    classifications,
  };
}

describe('localImport', () => {
  let db: Dexie;

  beforeEach(async () => {
    db = makeTestDb();
    await db.table<SignalRecord>('signals').clear();
    await db.table<ClassificationRecord>('classifications').clear();
  });

  it('rejects invalid JSON', async () => {
    const result = await importLocalData(db, 'not json');
    expect(result.errors).toContain('Invalid JSON');
    expect(result.importedSignals).toBe(0);
  });

  it('rejects wrong schemaVersion', async () => {
    const data = { schemaVersion: 2, app: 'signal-vault', exportedAt: '2025-01-01', signals: [], classifications: [] };
    const result = await importLocalData(db, JSON.stringify(data));
    expect(result.errors.some((e) => e.includes('schema version'))).toBe(true);
  });

  it('rejects wrong app name', async () => {
    const data = { schemaVersion: 1, app: 'other-app', exportedAt: '2025-01-01', signals: [], classifications: [] };
    const result = await importLocalData(db, JSON.stringify(data));
    expect(result.errors.some((e) => e.includes('app'))).toBe(true);
  });

  it('rejects missing fields', async () => {
    const data = { schemaVersion: 1, app: 'signal-vault', exportedAt: '2025-01-01' };
    const result = await importLocalData(db, JSON.stringify(data));
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('merges valid data', async () => {
    const claim = createClaim('entity-1', 'smart_gate', 'user_manual');
    const envelope = makeEnvelope([makeSignal('s1')], [claim]);
    const result = await importLocalData(db, JSON.stringify(envelope), 'merge');
    expect(result.errors).toEqual([]);
    expect(result.importedSignals).toBe(1);
    expect(result.importedClassifications).toBe(1);

    const signals = await loadAllSignals(db);
    const claims = await loadAllClassifications(db);
    expect(signals).toHaveLength(1);
    expect(claims).toHaveLength(1);
  });

  it('replaces valid data', async () => {
    // Pre-existing data
    await addSignal(db, makeSignal('old'));
    const oldClaim = createClaim('entity-old', 'market', 'user_manual');
    await addClassification(db, oldClaim);

    const claim = createClaim('entity-1', 'smart_gate', 'user_manual');
    const envelope = makeEnvelope([makeSignal('s1')], [claim]);
    const result = await importLocalData(db, JSON.stringify(envelope), 'replace');
    expect(result.errors).toEqual([]);
    expect(result.importedSignals).toBe(1);

    const signals = await loadAllSignals(db);
    const claims = await loadAllClassifications(db);
    expect(signals).toHaveLength(1);
    expect(signals.at(0)?.id).toBe('s1');
    expect(claims).toHaveLength(1);
  });
});
