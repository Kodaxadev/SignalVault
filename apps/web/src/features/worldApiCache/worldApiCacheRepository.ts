import type { Dexie } from 'dexie';
import type { WorldApiCacheRecord } from '@/features/local/localDbTypes';

export async function getCacheRecord<T>(db: Dexie, key: string): Promise<WorldApiCacheRecord<T> | undefined> {
  return db.table<WorldApiCacheRecord<T>>('worldApiCache').get(key);
}

export async function putCacheRecord<T>(db: Dexie, record: WorldApiCacheRecord<T>): Promise<void> {
  await db.table<WorldApiCacheRecord<T>>('worldApiCache').put(record);
}

export async function clearWorldApiCache(db: Dexie): Promise<void> {
  await db.table('worldApiCache').clear();
}
