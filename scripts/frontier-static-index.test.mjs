import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEcosystemIndex,
  buildFrontierStaticIndex,
  summarizeSystem,
} from './build-frontier-static-index.mjs';

const ECOSYSTEM_FIXTURE = {
  2: {
    name: 'Broken World\u00a0- Inner Belt - Derelict Quarry',
    description: '  Broken World  - Inner Belt  ',
    entryPattern: { dungeonID: 13717 },
    naturalWorldPatterns: [{ dungeonID: 13638 }],
    brokenWorldPatterns: [{ dungeonID: 13600 }, { dungeonID: 13601 }],
  },
  12: {
    name: 'Natural World  - Trojan - Garden',
    description: 'Natural World - Trojan - Garden',
    entryPattern: { dungeonID: 13722 },
  },
};

const LANDSCAPE_FIXTURE = {
  30000012: {
    asteroidBelts: {
      1: {
        tags: ['belt', 'inner', 'non_zero_danger_level'],
        sites: {
          1: { ecosystemID: 2, position: { x: 1, y: 2, z: 3 } },
          2: { ecosystemID: 12, position: { x: 4, y: 5, z: 6 } },
        },
      },
    },
    trojans: {
      2: {
        tags: ['trojan', 'outer'],
        sites: {
          3: { ecosystemID: 12, position: { x: 7, y: 8, z: 9 } },
        },
      },
    },
  },
};

describe('buildEcosystemIndex', () => {
  it('normalizes ecosystem labels and counts pattern families', () => {
    assert.deepEqual(buildEcosystemIndex(ECOSYSTEM_FIXTURE)['2'], {
      id: '2',
      name: 'Broken World - Inner Belt - Derelict Quarry',
      description: 'Broken World - Inner Belt',
      entryDungeonId: 13717,
      naturalPatternCount: 1,
      brokenPatternCount: 2,
    });
  });
});

describe('summarizeSystem', () => {
  it('summarizes site counts, tags, and ecosystem refs without coordinates', () => {
    const ecosystems = buildEcosystemIndex(ECOSYSTEM_FIXTURE);
    const summary = summarizeSystem(LANDSCAPE_FIXTURE['30000012'], {
      ecosystems,
      ecosystemUsage: new Map(),
      tagUsage: new Map(),
    });

    assert.deepEqual(summary, {
      siteCount: 3,
      beltGroups: 1,
      trojanGroups: 1,
      dangerTaggedGroups: 1,
      missingEcosystemRefs: 0,
      ecosystemIds: ['2', '12'],
      tags: ['belt', 'inner', 'non_zero_danger_level', 'outer', 'trojan'],
    });
  });
});

describe('buildFrontierStaticIndex', () => {
  it('builds a compact schema with stats and provenance', () => {
    const index = buildFrontierStaticIndex({
      ecosystem: ECOSYSTEM_FIXTURE,
      landscape: LANDSCAPE_FIXTURE,
      source: {
        ecosystem: 'ecosystem.fixture.json',
        landscape: 'landscape.fixture.json',
        provenance: 'fixture',
      },
    });

    assert.equal(index.schemaVersion, 1);
    assert.equal(index.source.provenance, 'fixture');
    assert.equal(index.stats.ecosystemCount, 2);
    assert.equal(index.stats.systemCount, 1);
    assert.equal(index.stats.siteCount, 3);
    assert.equal(index.stats.missingEcosystemRefs, 0);
    assert.equal(index.systems['30000012'].siteCount, 3);
    assert.equal(JSON.stringify(index).includes('position'), false);
  });

  it('reports missing ecosystem references instead of hiding drift', () => {
    const index = buildFrontierStaticIndex({
      ecosystem: ECOSYSTEM_FIXTURE,
      landscape: {
        30000013: {
          asteroidBelts: {
            1: { tags: ['belt'], sites: { 1: { ecosystemID: 999 } } },
          },
        },
      },
    });

    assert.equal(index.stats.missingEcosystemRefs, 1);
    assert.deepEqual(index.systems['30000013'].ecosystemIds, ['999']);
  });
});
