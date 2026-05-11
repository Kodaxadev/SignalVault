import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import type { ClassificationRecord } from '@/features/local/localDbTypes';
import { loadAllClassifications, addClassification, addClassificationsBatch, clearClassifications } from '@/features/local/localEntityClassificationRepository';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import { createClaim } from '@/features/entities/entityClassificationTypes';

function makeTestDb() {
  const db = new Dexie('test-classifications');
  db.version(1).stores({
    classifications: '&id, entityKey, createdAt',
  });
  return db;
}

describe('localEntityClassificationRepository', () => {
  let db: Dexie;
  let claim: EntityClassificationClaim;

  beforeEach(async () => {
    db = makeTestDb();
    await db.table<ClassificationRecord>('classifications').clear();
    claim = createClaim('entity-1', 'smart_gate', 'user_manual');
  });

  it('loads empty', async () => {
    const claims = await loadAllClassifications(db);
    expect(claims).toEqual([]);
  });

  it('adds a classification', async () => {
    await addClassification(db, claim);
    const claims = await loadAllClassifications(db);
    expect(claims).toHaveLength(1);
    expect(claims.at(0)?.id).toBe(claim.id);
  });

  it('batch adds classifications', async () => {
    const claims = [
      createClaim('entity-1', 'smart_gate', 'user_manual'),
      createClaim('entity-2', 'market', 'user_manual'),
      createClaim('entity-3', 'system', 'user_manual'),
    ];
    await addClassificationsBatch(db, claims);
    const loaded = await loadAllClassifications(db);
    expect(loaded).toHaveLength(3);
  });

  it('clears classifications', async () => {
    await addClassification(db, claim);
    await clearClassifications(db);
    const claims = await loadAllClassifications(db);
    expect(claims).toHaveLength(0);
  });
});
