import type { Dexie } from 'dexie';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { ClassificationRecord } from './localDbTypes';

export async function loadAllClassifications(db: Dexie): Promise<EntityClassificationClaim[]> {
  const records = await db.table<ClassificationRecord>('classifications').toArray();
  return records.map((r) => r.claim);
}

export async function addClassification(db: Dexie, claim: EntityClassificationClaim): Promise<void> {
  await db.table<ClassificationRecord>('classifications').put({
    id: claim.id,
    claim,
    entityKey: claim.entityKey,
    createdAt: claim.createdAt,
  });
}

export async function addClassificationsBatch(db: Dexie, claims: EntityClassificationClaim[]): Promise<void> {
  const records: ClassificationRecord[] = claims.map((c) => ({
    id: c.id,
    claim: c,
    entityKey: c.entityKey,
    createdAt: c.createdAt,
  }));
  await db.table<ClassificationRecord>('classifications').bulkPut(records);
}

export async function clearClassifications(db: Dexie): Promise<void> {
  await db.table<ClassificationRecord>('classifications').clear();
}
