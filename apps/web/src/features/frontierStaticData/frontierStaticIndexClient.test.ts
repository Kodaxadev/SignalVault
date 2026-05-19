import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  clearFrontierStaticIndexCache,
  fetchFrontierStaticIndex,
  getFrontierSystemIntel,
  isFrontierStaticIndex,
} from './frontierStaticIndexClient';
import type { FrontierStaticIndex } from './frontierStaticTypes';

const index: FrontierStaticIndex = {
  schemaVersion: 1,
  generatedAt: '2026-05-19T00:00:00.000Z',
  source: {
    ecosystem: 'ecosystem.json',
    landscape: 'landscape.json',
    provenance: 'test fixture',
  },
  stats: {
    ecosystemCount: 1,
    systemCount: 1,
    beltGroupCount: 3,
    trojanGroupCount: 2,
    siteCount: 9,
    missingEcosystemRefs: 0,
    topTags: [['belt', 3]],
    topEcosystems: [{ id: '12', count: 9, name: 'Natural World - Trojan - Garden' }],
  },
  ecosystems: {
    '12': {
      id: '12',
      name: 'Natural World - Trojan - Garden',
      description: 'Garden',
      entryDungeonId: 13941,
      naturalPatternCount: 8,
      brokenPatternCount: 0,
    },
  },
  systems: {
    '30000013': {
      siteCount: 9,
      beltGroups: 3,
      trojanGroups: 2,
      dangerTaggedGroups: 5,
      ecosystemIds: ['12'],
      tags: ['belt', 'trojan', 'non_zero_danger_level'],
    },
  },
};

describe('frontier static index client', () => {
  beforeEach(() => {
    clearFrontierStaticIndexCache();
  });

  it('accepts the compact index schema', () => {
    expect(isFrontierStaticIndex(index)).toBe(true);
    expect(isFrontierStaticIndex({ schemaVersion: 2 })).toBe(false);
  });

  it('fetches and validates the optional static index asset', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => index,
    })) as unknown as typeof fetch;

    await expect(fetchFrontierStaticIndex(fetcher)).resolves.toBe(index);
  });

  it('rejects missing or malformed index assets', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({ schemaVersion: 1 }),
    })) as unknown as typeof fetch;

    await expect(fetchFrontierStaticIndex(fetcher)).rejects.toThrow('schema');
  });

  it('summarizes system intel with ecosystem names', () => {
    expect(getFrontierSystemIntel(index, '30000013')).toMatchObject({
      siteCount: 9,
      beltGroups: 3,
      trojanGroups: 2,
      dangerTaggedGroups: 5,
      ecosystemNames: ['Natural World - Trojan - Garden'],
    });
    expect(getFrontierSystemIntel(index, 'missing')).toBeNull();
  });
});
