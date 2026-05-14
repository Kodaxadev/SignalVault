import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/features/local/localDb', () => ({ db: {} }));
vi.mock('./worldApiCacheRepository', () => ({
  getCacheRecord: vi.fn(),
  putCacheRecord: vi.fn(),
}));
vi.mock('@/features/worldApi/solarSystems/solarSystemRepository', () => ({
  fetchSolarSystem: vi.fn(),
}));
vi.mock('@/features/worldApi/tribes/tribeRepository', () => ({
  fetchTribe: vi.fn(),
}));
vi.mock('@/features/worldApi/types/gameTypeRepository', () => ({
  fetchGameType: vi.fn(),
}));

import { fetchSolarSystemCached, fetchTribeCached, fetchGameTypeCached } from './cachedWorldApiQueries';
import { getCacheRecord, putCacheRecord } from './worldApiCacheRepository';
import { fetchSolarSystem } from '@/features/worldApi/solarSystems/solarSystemRepository';
import type { SystemContext } from '@/features/worldApi/solarSystems/solarSystemExtractors';
import { fetchTribe } from '@/features/worldApi/tribes/tribeRepository';
import { fetchGameType } from '@/features/worldApi/types/gameTypeRepository';

const mockGetCacheRecord = vi.mocked(getCacheRecord);
const mockPutCacheRecord = vi.mocked(putCacheRecord);
const mockFetchSolarSystem = vi.mocked(fetchSolarSystem);
const mockFetchTribe = vi.mocked(fetchTribe);
const mockFetchGameType = vi.mocked(fetchGameType);

const SYSTEM_DATA: SystemContext = {
  id: '30000001',
  name: 'A 2560',
  constellationId: '20000001',
  regionId: '10000001',
  connectedSystemIds: [],
};

const FRESH_RECORD = {
  key: 'solar_system:30000001',
  kind: 'solar_system' as const,
  data: SYSTEM_DATA,
  fetchedAt: '2026-05-11T10:00:00.000Z',
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  schemaVersion: 1 as const,
};

const STALE_RECORD = {
  ...FRESH_RECORD,
  expiresAt: '2020-01-01T00:30:00.000Z',
};

describe('fetchSolarSystemCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPutCacheRecord.mockResolvedValue(undefined);
  });

  it('returns loaded from cache when fresh cache exists — skips network', async () => {
    mockGetCacheRecord.mockResolvedValue(FRESH_RECORD);
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('cache');
    expect((result as { data: typeof SYSTEM_DATA }).data).toEqual(SYSTEM_DATA);
    expect(mockFetchSolarSystem).not.toHaveBeenCalled();
  });

  it('fetches from network when no cache exists and writes to cache', async () => {
    mockGetCacheRecord.mockResolvedValue(undefined);
    mockFetchSolarSystem.mockResolvedValue({ status: 'loaded', data: SYSTEM_DATA });
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('network');
    expect((result as { data: typeof SYSTEM_DATA }).data).toEqual(SYSTEM_DATA);
    expect(mockPutCacheRecord).toHaveBeenCalledOnce();
  });

  it('fetches from network when stale cache exists and writes refreshed record', async () => {
    mockGetCacheRecord.mockResolvedValue(STALE_RECORD);
    mockFetchSolarSystem.mockResolvedValue({ status: 'loaded', data: SYSTEM_DATA });
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('network');
    expect(mockPutCacheRecord).toHaveBeenCalledOnce();
  });

  it('returns stale_fallback when network throws and stale cache exists', async () => {
    mockGetCacheRecord.mockResolvedValue(STALE_RECORD);
    mockFetchSolarSystem.mockRejectedValue(new Error('Network error'));
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('stale_fallback');
    expect((result as { source: string }).source).toBe('cache');
    expect((result as { data: typeof SYSTEM_DATA }).data).toEqual(SYSTEM_DATA);
    expect((result as { staleSince: string }).staleSince).toBe(STALE_RECORD.expiresAt);
  });

  it('returns unavailable when network throws and no cache exists', async () => {
    mockGetCacheRecord.mockResolvedValue(undefined);
    mockFetchSolarSystem.mockRejectedValue(new Error('Network error'));
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('unavailable');
    expect((result as { source: string }).source).toBe('none');
  });

  it('returns stale_fallback when network returns unavailable and stale cache exists', async () => {
    mockGetCacheRecord.mockResolvedValue(STALE_RECORD);
    mockFetchSolarSystem.mockResolvedValue({ status: 'unavailable', reason: 'API down' });
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('stale_fallback');
    expect((result as { data: typeof SYSTEM_DATA }).data).toEqual(SYSTEM_DATA);
  });

  it('returns unavailable when network returns unavailable and no cache exists', async () => {
    mockGetCacheRecord.mockResolvedValue(undefined);
    mockFetchSolarSystem.mockResolvedValue({ status: 'unavailable', reason: 'API down' });
    const result = await fetchSolarSystemCached('30000001');
    expect(result.status).toBe('unavailable');
    expect((result as { reason: string }).reason).toBe('API down');
  });
});

describe('fetchTribeCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPutCacheRecord.mockResolvedValue(undefined);
  });

  it('returns loaded from cache when fresh record exists', async () => {
    const tribeData = { id: '1000044', name: 'Amarr Empire', nameShort: 'AE' };
    const tribeFreshRecord = {
      key: 'tribe:1000044',
      kind: 'tribe' as const,
      data: tribeData,
      fetchedAt: '2026-05-11T10:00:00.000Z',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      schemaVersion: 1 as const,
    };
    mockGetCacheRecord.mockResolvedValue(tribeFreshRecord);
    const result = await fetchTribeCached('1000044');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('cache');
    expect(mockFetchTribe).not.toHaveBeenCalled();
  });

  it('fetches from network when no cache exists', async () => {
    const tribeData = { id: '1000044', name: 'Amarr Empire' };
    mockGetCacheRecord.mockResolvedValue(undefined);
    mockFetchTribe.mockResolvedValue({ status: 'loaded', data: tribeData });
    const result = await fetchTribeCached('1000044');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('network');
  });
});

describe('fetchGameTypeCached', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPutCacheRecord.mockResolvedValue(undefined);
  });

  it('returns loaded from cache when fresh record exists', async () => {
    const typeData = { id: '72244', name: 'Feral Data', groupName: 'Rogue Drone Analysis Data', categoryName: 'Commodity' };
    const typeFreshRecord = {
      key: 'game_type:72244',
      kind: 'game_type' as const,
      data: typeData,
      fetchedAt: '2026-05-11T10:00:00.000Z',
      // game_type TTL is 24h
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      schemaVersion: 1 as const,
    };
    mockGetCacheRecord.mockResolvedValue(typeFreshRecord);
    const result = await fetchGameTypeCached('72244');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('cache');
    expect(mockFetchGameType).not.toHaveBeenCalled();
  });

  it('fetches from network when no cache exists', async () => {
    const typeData = { id: '72244', name: 'Feral Data' };
    mockGetCacheRecord.mockResolvedValue(undefined);
    mockFetchGameType.mockResolvedValue({ status: 'loaded', data: typeData });
    const result = await fetchGameTypeCached('72244');
    expect(result.status).toBe('loaded');
    expect((result as { source: string }).source).toBe('network');
  });
});
