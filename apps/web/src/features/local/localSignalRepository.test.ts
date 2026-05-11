import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import type { SignalRecord } from '@/features/local/localDbTypes';
import { loadAllSignals, addSignal, addSignalsBatch, clearSignals, updateSignal } from '@/features/local/localSignalRepository';
import type { Signal } from '@/features/signals/signalTypes';

function makeTestDb() {
  const db = new Dexie('test-signals');
  db.version(1).stores({
    signals: '&id, entityKey, createdAt',
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

describe('localSignalRepository', () => {
  let db: Dexie;

  beforeEach(async () => {
    db = makeTestDb();
    await db.table<SignalRecord>('signals').clear();
  });

  it('loads empty', async () => {
    const signals = await loadAllSignals(db);
    expect(signals).toEqual([]);
  });

  it('adds a signal', async () => {
    const signal = makeSignal('sig-1');
    await addSignal(db, signal);
    const signals = await loadAllSignals(db);
    expect(signals).toHaveLength(1);
    expect(signals.at(0)?.id).toBe('sig-1');
  });

  it('gets all signals', async () => {
    await addSignal(db, makeSignal('sig-1'));
    await addSignal(db, makeSignal('sig-2'));
    const signals = await loadAllSignals(db);
    expect(signals).toHaveLength(2);
    expect(signals.map((s) => s.id)).toContain('sig-1');
    expect(signals.map((s) => s.id)).toContain('sig-2');
  });

  it('batch adds signals', async () => {
    const signals = [makeSignal('b-1'), makeSignal('b-2'), makeSignal('b-3')];
    await addSignalsBatch(db, signals);
    const loaded = await loadAllSignals(db);
    expect(loaded).toHaveLength(3);
  });

  it('clears signals', async () => {
    await addSignal(db, makeSignal('sig-1'));
    await clearSignals(db);
    const signals = await loadAllSignals(db);
    expect(signals).toHaveLength(0);
  });

  it('updates a signal in place', async () => {
    const signal = makeSignal('sig-1');
    await addSignal(db, signal);

    const updated = { ...signal, syncState: 'remote_saved' as const };
    await updateSignal(db, updated);

    const signals = await loadAllSignals(db);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.syncState).toBe('remote_saved');
  });
});
