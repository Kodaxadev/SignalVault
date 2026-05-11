import { db } from '@/features/local/localDb';
import { fetchSolarSystem } from '@/features/worldApi/solarSystems/solarSystemRepository';
import { fetchTribe } from '@/features/worldApi/tribes/tribeRepository';
import { fetchGameType } from '@/features/worldApi/types/gameTypeRepository';
import type { SystemContext } from '@/features/worldApi/solarSystems/solarSystemExtractors';
import type { TribeContext } from '@/features/worldApi/tribes/tribeExtractors';
import type { TypeContext } from '@/features/worldApi/types/gameTypeExtractors';
import type { WorldApiResult } from '@/features/worldApi/worldApiTypes';
import type { WorldApiCacheKind, WorldApiCacheRecord } from '@/features/local/localDbTypes';
import type { CachedWorldApiResult } from './worldApiCacheTypes';
import { buildCacheKey, buildCacheRecord, isCacheRecordFresh } from './worldApiCachePolicy';
import { getCacheRecord, putCacheRecord } from './worldApiCacheRepository';

async function resolveWithCache<T>(
  kind: WorldApiCacheKind,
  id: string,
  fetcher: () => Promise<WorldApiResult<T>>,
): Promise<CachedWorldApiResult<T>> {
  const key = buildCacheKey(kind, id);

  let cached: WorldApiCacheRecord<T> | undefined;
  try {
    cached = await getCacheRecord<T>(db, key);
  } catch {
    // DB read failure — proceed without cache
  }

  if (cached && isCacheRecordFresh(cached)) {
    return { status: 'loaded', source: 'cache', data: cached.data };
  }

  try {
    const result = await fetcher();
    if (result.status === 'loaded') {
      try {
        await putCacheRecord(db, buildCacheRecord(kind, id, result.data));
      } catch {
        // Cache write failure is non-fatal — still return data
      }
      return { status: 'loaded', source: 'network', data: result.data };
    }
    // Network returned unavailable — fall back to stale cache if any
    if (cached) {
      return { status: 'stale_fallback', source: 'cache', data: cached.data, staleSince: cached.expiresAt };
    }
    return { status: 'unavailable', source: 'none', reason: result.reason };
  } catch (err) {
    if (cached) {
      return { status: 'stale_fallback', source: 'cache', data: cached.data, staleSince: cached.expiresAt };
    }
    return {
      status: 'unavailable',
      source: 'none',
      reason: err instanceof Error ? err.message : 'network error',
    };
  }
}

export function fetchSolarSystemCached(id: string): Promise<CachedWorldApiResult<SystemContext>> {
  return resolveWithCache('solar_system', id, () => fetchSolarSystem(id));
}

export function fetchTribeCached(id: string): Promise<CachedWorldApiResult<TribeContext>> {
  return resolveWithCache('tribe', id, () => fetchTribe(id));
}

export function fetchGameTypeCached(id: string): Promise<CachedWorldApiResult<TypeContext>> {
  return resolveWithCache('game_type', id, () => fetchGameType(id));
}
