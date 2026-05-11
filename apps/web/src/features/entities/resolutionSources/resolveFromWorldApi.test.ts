import { describe, it, expect } from 'vitest';
import { resolveFromWorldApi } from './resolveFromWorldApi';
import { resolveEntity } from '@/features/entities/resolveEntity';
import { SOURCE_PRIORITY } from '@/features/entities/entityClassificationTypes';
import type { SystemContext } from '@/features/worldApi/solarSystems/solarSystemExtractors';
import type { TribeContext } from '@/features/worldApi/tribes/tribeExtractors';
import type { TypeContext } from '@/features/worldApi/types/gameTypeExtractors';
import type { WorldApiEntityContext } from './worldApiEntityClaimTypes';

const ENTITY_KEY = 'item:stillness:30000001';

const SYSTEM_CTX: SystemContext = {
  id: '30000001',
  name: 'A 2560',
  constellationId: '20000001',
  regionId: '10000001',
  connectedSystemIds: ['30000002', '30000003'],
};

const TRIBE_CTX: TribeContext = {
  id: '1000044',
  name: 'Amarr Empire',
  nameShort: 'AE',
  description: 'An empire',
};

const TYPE_CTX: TypeContext = {
  id: '72244',
  name: 'Feral Data',
  groupName: 'Rogue Drone Analysis Data',
  categoryName: 'Commodity',
};

// TypeContext that looks like a gate — World API must NOT classify this as smart_gate
const GATE_LIKE_TYPE_CTX: TypeContext = {
  id: '99999',
  name: 'Smart Gate Type',
  groupName: 'Smart Gate',
  categoryName: 'Smart Assembly',
};

describe('resolveFromWorldApi — null/missing context', () => {
  it('returns empty array for null context', () => {
    expect(resolveFromWorldApi(ENTITY_KEY, null)).toEqual([]);
  });

  it('returns empty array for undefined context', () => {
    expect(resolveFromWorldApi(ENTITY_KEY, undefined)).toEqual([]);
  });
});

describe('resolveFromWorldApi — source priority', () => {
  it('world_api priority is 75', () => {
    expect(SOURCE_PRIORITY['world_api']).toBe(75);
  });

  it('world_api is below dappkit_current_object (80)', () => {
    expect(SOURCE_PRIORITY['world_api']).toBeLessThan(SOURCE_PRIORITY['dappkit_current_object']);
  });

  it('world_api is above user_manual (30)', () => {
    expect(SOURCE_PRIORITY['world_api']).toBeGreaterThan(SOURCE_PRIORITY['user_manual']);
  });

  it('world_api is above url_hint (10)', () => {
    expect(SOURCE_PRIORITY['world_api']).toBeGreaterThan(SOURCE_PRIORITY['url_hint']);
  });
});

describe('resolveFromWorldApi — system context', () => {
  const ctx: WorldApiEntityContext = { kind: 'system', context: SYSTEM_CTX };

  it('produces exactly one claim', () => {
    expect(resolveFromWorldApi(ENTITY_KEY, ctx)).toHaveLength(1);
  });

  it('claim source is world_api', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.source).toBe('world_api');
  });

  it('claim type is system', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.claimedType).toBe('system');
  });

  it('claim label is the system name', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.label).toBe('A 2560');
  });

  it('claim priority is 75', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.priority).toBe(75);
  });

  it('claim confidence is cached', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.confidence).toBe('cached');
  });
});

describe('resolveFromWorldApi — tribe context', () => {
  const ctx: WorldApiEntityContext = { kind: 'tribe', context: TRIBE_CTX };

  it('produces exactly one claim', () => {
    expect(resolveFromWorldApi(ENTITY_KEY, ctx)).toHaveLength(1);
  });

  it('claim type is tribe', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.claimedType).toBe('tribe');
  });

  it('claim label is the tribe name', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.label).toBe('Amarr Empire');
  });

  it('claim source is world_api', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.source).toBe('world_api');
  });
});

describe('resolveFromWorldApi — type context (conservative)', () => {
  const ctx: WorldApiEntityContext = { kind: 'type', context: TYPE_CTX };

  it('produces exactly one claim', () => {
    expect(resolveFromWorldApi(ENTITY_KEY, ctx)).toHaveLength(1);
  });

  it('claim type is item — not a Smart Assembly subtype', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.claimedType).toBe('item');
  });

  it('claim label is the type name', () => {
    const [claim] = resolveFromWorldApi(ENTITY_KEY, ctx);
    expect(claim?.label).toBe('Feral Data');
  });

  it('regression: gate-like type name does NOT produce smart_gate claim', () => {
    const gateCtx: WorldApiEntityContext = { kind: 'type', context: GATE_LIKE_TYPE_CTX };
    const [claim] = resolveFromWorldApi(ENTITY_KEY, gateCtx);
    expect(claim?.claimedType).not.toBe('smart_gate');
    expect(claim?.claimedType).not.toBe('smart_storage_unit');
    expect(claim?.claimedType).not.toBe('market');
    expect(claim?.claimedType).not.toBe('smart_turret');
    expect(claim?.claimedType).toBe('item');
  });
});

describe('resolveEntity with worldApiContext', () => {
  const baseContext = { tenant: 'stillness', itemId: '30000001', entityType: 'unknown' as const, confidence: 'unknown' as const };

  it('world_api system claim wins over url_hint for type', () => {
    const result = resolveEntity(baseContext, {
      worldApiContext: { kind: 'system', context: SYSTEM_CTX },
    });
    expect(result.type).toBe('system');
    expect(result.label).toBe('A 2560');
  });

  it('world_api source appears in sources list', () => {
    const result = resolveEntity(baseContext, {
      worldApiContext: { kind: 'system', context: SYSTEM_CTX },
    });
    expect(result.sources).toContain('world_api');
  });

  it('omitting worldApiContext leaves resolution unchanged', () => {
    const withoutWorldApi = resolveEntity(baseContext);
    const withNull = resolveEntity(baseContext, { worldApiContext: null });
    expect(withoutWorldApi.type).toBe(withNull.type);
    expect(withoutWorldApi.sources).not.toContain('world_api');
    expect(withNull.sources).not.toContain('world_api');
  });

  it('dappkit_current_object beats world_api when both present', () => {
    const result = resolveEntity(baseContext, {
      worldApiContext: { kind: 'system', context: SYSTEM_CTX },
      dappKitSnapshot: {
        status: 'available',
        available: true,
        tenant: 'stillness',
        objectId: '30000001',
        assemblyType: 'SmartGate',
      },
    });
    // dappkit (priority 80) beats world_api (priority 75)
    expect(result.type).toBe('smart_gate');
  });
});
