import { describe, it, expect } from 'vitest';
import { resolveFromDappKitContext } from './resolveFromDappKitContext';
import type { SmartObjectContextSnapshot } from '@/features/entities/smartObjectContextSnapshot';

describe('resolveFromDappKitContext', () => {
  it('returns empty claims for unavailable snapshot', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'unavailable',
      available: false,
      reason: 'not_connected',
    };
    const claims = resolveFromDappKitContext(snapshot);
    expect(claims).toEqual([]);
  });

  it('returns empty claims for loading snapshot', () => {
    const snapshot: SmartObjectContextSnapshot = { status: 'loading', available: false };
    const claims = resolveFromDappKitContext(snapshot);
    expect(claims).toEqual([]);
  });

  it('returns dappkit_current_object claim for available snapshot', () => {
    const snapshot: SmartObjectContextSnapshot = {
      status: 'available',
      available: true,
      tenant: 'utopia',
      objectId: 'gate-1',
      assemblyType: 'SmartGate',
      raw: { id: 'gate-1', type: 'SmartGate' },
    };
    const claims = resolveFromDappKitContext(snapshot);
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
});
