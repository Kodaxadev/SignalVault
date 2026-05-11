import { describe, it, expect } from 'vitest';
import { resolveFrontierCharacter } from '@/features/viewer/resolveFrontierCharacter';
import type { FrontierCharacterSnapshot } from '@/features/frontier/character/frontierCharacterTypes';
import type { ViewerContext } from '@/features/viewer/viewerTypes';

describe('resolveFrontierCharacter', () => {
  const walletViewer: ViewerContext = {
    state: 'wallet_connected',
    walletAddress: '0xabc123',
    roles: [],
  };

  const resolvedSnapshot: FrontierCharacterSnapshot = {
    status: 'resolved',
    source: 'wallet_profile',
    walletAddress: '0xabc123',
    characterId: 'char-001',
    characterObjectId: 'obj-001',
    characterName: 'Test Character',
    tribeId: 'tribe-001',
    tribeName: 'Test Tribe',
  };

  it('upgrades wallet_connected + resolved → character_resolved', () => {
    const result = resolveFrontierCharacter(walletViewer, resolvedSnapshot);
    expect(result.state).toBe('character_resolved');
    expect(result.walletAddress).toBe('0xabc123');
    expect(result.characterId).toBe('char-001');
    expect(result.characterObjectId).toBe('obj-001');
    expect(result.characterName).toBe('Test Character');
    expect(result.tribeId).toBe('tribe-001');
    expect(result.tribeName).toBe('Test Tribe');
    expect(result.roles).toEqual([]);
    expect(result.canWriteShared).toBe(true);
    expect(result.canReadScopes).toEqual(['public', 'private', 'tribe']);
  });

  it('returns viewer unchanged when state is anonymous', () => {
    const anonymous: ViewerContext = { state: 'anonymous', roles: [] };
    const result = resolveFrontierCharacter(anonymous, resolvedSnapshot);
    expect(result).toBe(anonymous);
    expect(result.state).toBe('anonymous');
  });

  it('returns viewer unchanged when wallet mismatch', () => {
    const mismatchSnapshot: FrontierCharacterSnapshot = {
      ...resolvedSnapshot,
      walletAddress: '0xdifferent',
    };
    const result = resolveFrontierCharacter(walletViewer, mismatchSnapshot);
    expect(result).toBe(walletViewer);
    expect(result.state).toBe('wallet_connected');
  });

  it('returns viewer unchanged when snapshot is unavailable', () => {
    const unavailable: FrontierCharacterSnapshot = { status: 'unavailable', reason: 'resolver_unavailable' };
    const result = resolveFrontierCharacter(walletViewer, unavailable);
    expect(result).toBe(walletViewer);
    expect(result.state).toBe('wallet_connected');
  });

  it('character_resolved has roles: [] always', () => {
    const viewerWithRoles: ViewerContext = {
      state: 'wallet_connected',
      walletAddress: '0xabc123',
      roles: ['scout', 'officer'],
    };
    const result = resolveFrontierCharacter(viewerWithRoles, resolvedSnapshot);
    expect(result.roles).toEqual([]);
  });

  it('character_resolved without tribe has canReadScopes: public, private', () => {
    const noTribeSnapshot: FrontierCharacterSnapshot = {
      status: 'resolved',
      source: 'wallet_profile',
      walletAddress: '0xabc123',
      characterId: 'char-001',
    };
    const result = resolveFrontierCharacter(walletViewer, noTribeSnapshot);
    expect(result.state).toBe('character_resolved');
    expect(result.canReadScopes).toEqual(['public', 'private']);
  });

  it('returns viewer unchanged when viewer is already character_resolved', () => {
    const alreadyResolved: ViewerContext = {
      state: 'character_resolved',
      walletAddress: '0xabc123',
      characterId: 'char-existing',
      roles: [],
    };
    const result = resolveFrontierCharacter(alreadyResolved, resolvedSnapshot);
    expect(result).toBe(alreadyResolved);
  });

  it('returns explicit object — not a spread of viewer', () => {
    const viewerWithTenant: ViewerContext = {
      state: 'wallet_connected',
      walletAddress: '0xabc123',
      roles: [],
      tenant: 'test-tenant',
    };
    const result = resolveFrontierCharacter(viewerWithTenant, resolvedSnapshot);
    expect(result.state).toBe('character_resolved');
    expect(result.tenant).toBeUndefined();
  });
});
