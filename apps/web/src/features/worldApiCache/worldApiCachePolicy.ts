import type { WorldApiCacheKind, WorldApiCacheRecord } from '@/features/local/localDbTypes';

const TTL_MS: Record<WorldApiCacheKind, number> = {
  solar_system: 30 * 60 * 1000,
  tribe: 30 * 60 * 1000,
  game_type: 24 * 60 * 60 * 1000,
};

export function buildCacheKey(kind: WorldApiCacheKind, id: string): string {
  return `${kind}:${id}`;
}

export function getTtlMs(kind: WorldApiCacheKind): number {
  return TTL_MS[kind];
}

export function buildCacheRecord<T>(kind: WorldApiCacheKind, id: string, data: T): WorldApiCacheRecord<T> {
  const now = new Date();
  return {
    key: buildCacheKey(kind, id),
    kind,
    data,
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TTL_MS[kind]).toISOString(),
    schemaVersion: 1,
  };
}

export function isCacheRecordFresh(record: WorldApiCacheRecord): boolean {
  return new Date(record.expiresAt) > new Date();
}
