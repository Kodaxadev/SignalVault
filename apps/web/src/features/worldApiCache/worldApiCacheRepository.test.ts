import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { getCacheRecord, putCacheRecord, clearWorldApiCache } from './worldApiCacheRepository';
import type { WorldApiCacheRecord } from '@/features/local/localDbTypes';

function makeTestDb(): Dexie {
  const db = new Dexie(`test-world-api-cache-${Math.random()}`);
  db.version(1).stores({ worldApiCache: '&key, kind, expiresAt' });
  return db;
}

function makeRecord(key: string, name: string): WorldApiCacheRecord {
  return {
    key,
    kind: 'solar_system',
    data: { name },
    fetchedAt: '2026-05-11T10:00:00.000Z',
    expiresAt: '2026-05-11T10:30:00.000Z',
    schemaVersion: 1,
  };
}

describe('worldApiCacheRepository', () => {
  let db: Dexie;

  beforeEach(async () => {
    db = makeTestDb();
    await db.table('worldApiCache').clear();
  });

  it('getCacheRecord returns undefined for missing key', async () => {
    const result = await getCacheRecord(db, 'solar_system:99999');
    expect(result).toBeUndefined();
  });

  it('putCacheRecord then getCacheRecord returns the stored record', async () => {
    const record = makeRecord('solar_system:30000001', 'Jita');
    await putCacheRecord(db, record);
    const result = await getCacheRecord(db, 'solar_system:30000001');
    expect(result).toEqual(record);
  });

  it('putCacheRecord overwrites existing record with same key', async () => {
    const first = makeRecord('tribe:1000', 'Alpha');
    const second = { ...first, data: { name: 'Beta' } };
    await putCacheRecord(db, first);
    await putCacheRecord(db, second);
    const result = await getCacheRecord(db, 'tribe:1000');
    expect((result?.data as { name: string }).name).toBe('Beta');
  });

  it('stores records for different keys independently', async () => {
    const sys = makeRecord('solar_system:1', 'Jita');
    const tribe = { ...makeRecord('tribe:1', 'Amarr'), kind: 'tribe' as const };
    await putCacheRecord(db, sys);
    await putCacheRecord(db, tribe);
    const sysResult = await getCacheRecord(db, 'solar_system:1');
    const tribeResult = await getCacheRecord(db, 'tribe:1');
    expect((sysResult?.data as { name: string }).name).toBe('Jita');
    expect((tribeResult?.data as { name: string }).name).toBe('Amarr');
  });

  it('clearWorldApiCache removes all records', async () => {
    await putCacheRecord(db, makeRecord('solar_system:1', 'A'));
    await putCacheRecord(db, makeRecord('solar_system:2', 'B'));
    await clearWorldApiCache(db);
    expect(await getCacheRecord(db, 'solar_system:1')).toBeUndefined();
    expect(await getCacheRecord(db, 'solar_system:2')).toBeUndefined();
  });
});
