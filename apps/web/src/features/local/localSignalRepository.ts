import type { Dexie } from 'dexie';
import type { Signal } from '@/features/signals/signalTypes';
import type { SignalRecord } from './localDbTypes';

export async function loadAllSignals(db: Dexie): Promise<Signal[]> {
  const records = await db.table<SignalRecord>('signals').toArray();
  return records.map((r) => r.signal);
}

export async function addSignal(db: Dexie, signal: Signal): Promise<void> {
  const entityKey = signal.linkedEntities[0]?.entityId ?? '';
  await db.table<SignalRecord>('signals').put({
    id: signal.id,
    signal,
    entityKey,
    createdAt: signal.createdAt,
  });
}

export async function addSignalsBatch(db: Dexie, signals: Signal[]): Promise<void> {
  const records: SignalRecord[] = signals.map((s) => ({
    id: s.id,
    signal: s,
    entityKey: s.linkedEntities[0]?.entityId ?? '',
    createdAt: s.createdAt,
  }));
  await db.table<SignalRecord>('signals').bulkPut(records);
}

export async function updateSignal(db: Dexie, signal: Signal): Promise<void> {
  const entityKey = signal.linkedEntities[0]?.entityId ?? '';
  await db.table<SignalRecord>('signals').put({
    id: signal.id,
    signal,
    entityKey,
    createdAt: signal.createdAt,
  });
}

export async function clearSignals(db: Dexie): Promise<void> {
  await db.table<SignalRecord>('signals').clear();
}
