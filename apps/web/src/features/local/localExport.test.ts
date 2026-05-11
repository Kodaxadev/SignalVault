import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import type { SignalRecord, ClassificationRecord } from '@/features/local/localDbTypes';
import { exportLocalData } from '@/features/local/localExport';
import { addSignal } from '@/features/local/localSignalRepository';
import { addClassification } from '@/features/local/localEntityClassificationRepository';
import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { Signal } from '@/features/signals/signalTypes';

function makeTestDb() {
  const db = new Dexie('test-export');
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

describe('localExport', () => {
  let db: Dexie;

  beforeEach(async () => {
    db = makeTestDb();
    await db.table<SignalRecord>('signals').clear();
    await db.table<ClassificationRecord>('classifications').clear();
  });

  it('exports with schemaVersion: 1', async () => {
    const data = await exportLocalData(db);
    expect(data.schemaVersion).toBe(1);
  });

  it('exports with app: "signal-vault"', async () => {
    const data = await exportLocalData(db);
    expect(data.app).toBe('signal-vault');
  });

  it('exports with timestamp', async () => {
    const data = await exportLocalData(db);
    expect(data.exportedAt).toBeDefined();
    expect(typeof data.exportedAt).toBe('string');
  });

  it('exports signals and classifications', async () => {
    await addSignal(db, makeSignal('s1'));
    const claim = createClaim('entity-1', 'smart_gate', 'user_manual');
    await addClassification(db, claim);

    const data = await exportLocalData(db);
    expect(data.signals).toHaveLength(1);
    expect(data.classifications).toHaveLength(1);
    expect(data.signals.at(0)?.id).toBe('s1');
    expect(data.classifications.at(0)?.entityKey).toBe('entity-1');
  });
});
