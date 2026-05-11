import type { Dexie } from 'dexie';
import type { Signal } from '@/features/signals/signalTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { SignalRecord, ClassificationRecord } from './localDbTypes';

export type LocalExportEnvelopeV1 = {
  schemaVersion: 1;
  app: 'signal-vault';
  exportedAt: string;
  signals: Signal[];
  classifications: EntityClassificationClaim[];
};

export async function exportLocalData(db: Dexie): Promise<LocalExportEnvelopeV1> {
  const signalRecords = await db.table<SignalRecord>('signals').toArray();
  const classificationRecords = await db.table<ClassificationRecord>('classifications').toArray();

  return {
    schemaVersion: 1,
    app: 'signal-vault',
    exportedAt: new Date().toISOString(),
    signals: signalRecords.map((r) => r.signal),
    classifications: classificationRecords.map((r) => r.claim),
  };
}
