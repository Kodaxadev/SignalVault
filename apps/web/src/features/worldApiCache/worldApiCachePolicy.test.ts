import { describe, it, expect } from 'vitest';
import {
  buildCacheKey,
  buildCacheRecord,
  isCacheRecordFresh,
  getTtlMs,
} from './worldApiCachePolicy';
import type { WorldApiCacheRecord } from '@/features/local/localDbTypes';

describe('buildCacheKey', () => {
  it('formats solar_system key', () => {
    expect(buildCacheKey('solar_system', '30000001')).toBe('solar_system:30000001');
  });

  it('formats tribe key', () => {
    expect(buildCacheKey('tribe', '1000044')).toBe('tribe:1000044');
  });

  it('formats game_type key', () => {
    expect(buildCacheKey('game_type', '72244')).toBe('game_type:72244');
  });
});

describe('getTtlMs', () => {
  it('solar_system TTL is 30 minutes', () => {
    expect(getTtlMs('solar_system')).toBe(30 * 60 * 1000);
  });

  it('tribe TTL is 30 minutes', () => {
    expect(getTtlMs('tribe')).toBe(30 * 60 * 1000);
  });

  it('game_type TTL is 24 hours', () => {
    expect(getTtlMs('game_type')).toBe(24 * 60 * 60 * 1000);
  });

  it('game_type TTL is longer than solar_system TTL', () => {
    expect(getTtlMs('game_type')).toBeGreaterThan(getTtlMs('solar_system'));
  });
});

describe('buildCacheRecord', () => {
  it('sets key using buildCacheKey convention', () => {
    const record = buildCacheRecord('solar_system', '30000001', {});
    expect(record.key).toBe('solar_system:30000001');
  });

  it('sets kind correctly', () => {
    const record = buildCacheRecord('tribe', '1000', {});
    expect(record.kind).toBe('tribe');
  });

  it('stores normalized data unchanged', () => {
    const data = { id: '1', name: 'Jita', constellationId: '100', regionId: '200', connectedSystemIds: [] };
    const record = buildCacheRecord('solar_system', '1', data);
    expect(record.data).toEqual(data);
  });

  it('sets schemaVersion to 1', () => {
    const record = buildCacheRecord('game_type', '72244', {});
    expect(record.schemaVersion).toBe(1);
  });

  it('sets fetchedAt near now', () => {
    const before = Date.now();
    const record = buildCacheRecord('solar_system', '1', {});
    const after = Date.now();
    const fetchedAt = new Date(record.fetchedAt).getTime();
    expect(fetchedAt).toBeGreaterThanOrEqual(before);
    expect(fetchedAt).toBeLessThanOrEqual(after);
  });

  it('sets expiresAt 30 min ahead for solar_system', () => {
    const before = Date.now();
    const record = buildCacheRecord('solar_system', '1', {});
    const expiresAt = new Date(record.expiresAt).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 30 * 60 * 1000 - 100);
    expect(expiresAt).toBeLessThanOrEqual(before + 30 * 60 * 1000 + 100);
  });

  it('sets expiresAt 24 hours ahead for game_type', () => {
    const before = Date.now();
    const record = buildCacheRecord('game_type', '1', {});
    const expiresAt = new Date(record.expiresAt).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000 - 100);
    expect(expiresAt).toBeLessThanOrEqual(before + 24 * 60 * 60 * 1000 + 100);
  });
});

describe('isCacheRecordFresh', () => {
  it('returns true for a freshly built record', () => {
    const record = buildCacheRecord('solar_system', '1', {});
    expect(isCacheRecordFresh(record)).toBe(true);
  });

  it('returns false for a record with past expiresAt', () => {
    const stale: WorldApiCacheRecord = {
      key: 'solar_system:1',
      kind: 'solar_system',
      data: {},
      fetchedAt: '2020-01-01T00:00:00.000Z',
      expiresAt: '2020-01-01T00:30:00.000Z',
      schemaVersion: 1,
    };
    expect(isCacheRecordFresh(stale)).toBe(false);
  });
});
