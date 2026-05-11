import { describe, it, expect } from 'vitest';
import { smartObjectToEntityClaim } from './smartObjectToEntityClaim';
import type { SmartObjectContextSnapshot } from '@/features/entities/smartObjectContextSnapshot';

describe('smartObjectToEntityClaim', () => {
  it('returns empty array for loading state', () => {
    const snapshot: SmartObjectContextSnapshot = { status: 'loading', available: false };
    expect(smartObjectToEntityClaim(snapshot)).toEqual([]);
  });

  it('returns empty array for unavailable state', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'unavailable',
      available: false,
      reason: 'no_assembly',
    };
    expect(smartObjectToEntityClaim(snapshot)).toEqual([]);
  });

  it('returns claim for available SmartGate', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      tenant: 'utopia',
      objectId: 'gate-1',
      assemblyType: 'SmartGate',
      assemblyName: 'My Gate',
      raw: { id: 'gate-1', type: 'SmartGate' },
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims).toHaveLength(1);
    expect(claims[0]!).toMatchObject({
      entityKey: 'gate-1',
      claimedType: 'smart_gate',
      source: 'dappkit_current_object',
    });
    expect(claims[0]!.evidence).toEqual({
      tenant: 'utopia',
      objectId: 'gate-1',
      raw: { id: 'gate-1', type: 'SmartGate' },
    });
  });

  it('maps SmartStorageUnit correctly', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      assemblyType: 'SmartStorageUnit',
      objectId: 'storage-1',
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims[0]!.claimedType).toBe('smart_storage_unit');
  });

  it('maps SmartTurret correctly', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      assemblyType: 'SmartTurret',
      objectId: 'turret-1',
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims[0]!.claimedType).toBe('smart_turret');
  });

  it('maps NetworkNode correctly', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      assemblyType: 'NetworkNode',
      objectId: 'node-1',
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims[0]!.claimedType).toBe('network_node');
  });

  it('maps unknown assembly types to unknown', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      assemblyType: 'SomeWeirdThing',
      objectId: 'weird-1',
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims[0]!.claimedType).toBe('unknown');
  });

  it('falls back to dappkit-tenant key when objectId is missing', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      tenant: 'utopia',
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims[0]!.entityKey).toBe('dappkit-utopia');
  });

  it('falls back to unknown entity type when assemblyType is undefined', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      objectId: 'obj-1',
    };
    const claims = smartObjectToEntityClaim(snapshot);
    expect(claims[0]!.claimedType).toBe('unknown');
  });
});
