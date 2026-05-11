import { describe, it, expect } from 'vitest';
import type { ViewerContext } from '@/features/viewer';
import {
  resolveTribeIdentity,
  getAvailableTribeScopes,
  evaluateCreateTribeScope,
  evaluateReadTribeScope,
  evaluateExportTribeScope,
  getLockedTribeScopes,
} from './tribePolicy';

const anonymousViewer = (): ViewerContext => ({ state: 'anonymous', roles: [] });
const walletViewer = (): ViewerContext => ({
  state: 'wallet_connected',
  walletAddress: '0xwallet',
  roles: [],
});
const characterViewer = (tribeId?: string, roles: string[] = []): ViewerContext => ({
  state: 'character_resolved',
  walletAddress: '0xwallet',
  characterId: 'char-1',
  characterName: 'Test',
  tribeId,
  roles,
});

describe('resolveTribeIdentity', () => {
  it('returns null for anonymous viewer', () => {
    expect(resolveTribeIdentity(anonymousViewer())).toBeNull();
  });

  it('returns null for wallet viewer', () => {
    expect(resolveTribeIdentity(walletViewer())).toBeNull();
  });

  it('returns null for character without tribe', () => {
    expect(resolveTribeIdentity(characterViewer())).toBeNull();
  });

  it('returns identity for character with tribe', () => {
    const identity = resolveTribeIdentity(characterViewer('tribe-1', ['officer']));
    expect(identity).not.toBeNull();
    expect(identity!.tribeId).toBe('tribe-1');
    expect(identity!.roles).toContain('officer');
  });
});

describe('getAvailableTribeScopes', () => {
  it('returns empty for anonymous', () => {
    expect(getAvailableTribeScopes(anonymousViewer())).toEqual([]);
  });

  it('returns empty for character without tribe', () => {
    expect(getAvailableTribeScopes(characterViewer())).toEqual([]);
  });

  it('returns tribe scope for character with tribe and no roles', () => {
    expect(getAvailableTribeScopes(characterViewer('tribe-1'))).toEqual(['tribe']);
  });

  it('returns tribe and officer for officer', () => {
    expect(getAvailableTribeScopes(characterViewer('tribe-1', ['officer']))).toEqual(['tribe', 'officer']);
  });

  it('returns only tribe for scout (scout_cell locked in 09A)', () => {
    expect(getAvailableTribeScopes(characterViewer('tribe-1', ['scout']))).toEqual(['tribe']);
  });
});

describe('evaluateCreateTribeScope', () => {
  it('denies anonymous for all tribe scopes', () => {
    expect(evaluateCreateTribeScope(anonymousViewer(), 'tribe')).toEqual({ allowed: false, reason: 'not_character_resolved' });
    expect(evaluateCreateTribeScope(anonymousViewer(), 'officer')).toEqual({ allowed: false, reason: 'not_character_resolved' });
  });

  it('denies character without tribe', () => {
    expect(evaluateCreateTribeScope(characterViewer(), 'tribe')).toEqual({ allowed: false, reason: 'tribe_missing' });
  });

  it('allows tribe scope for character with tribe', () => {
    expect(evaluateCreateTribeScope(characterViewer('tribe-1'), 'tribe')).toEqual({ allowed: true });
  });

  it('allows officer scope for officer', () => {
    expect(evaluateCreateTribeScope(characterViewer('tribe-1', ['officer']), 'officer')).toEqual({ allowed: true });
  });

  it('denies officer scope for non-officer', () => {
    expect(evaluateCreateTribeScope(characterViewer('tribe-1'), 'officer')).toEqual({ allowed: false, reason: 'officer_role_missing' });
  });

  it('denies scout_cell scope even for scout (09A)', () => {
    expect(evaluateCreateTribeScope(characterViewer('tribe-1', ['scout']), 'scout_cell')).toEqual({ allowed: false, reason: 'cell_identity_missing' });
  });
});

describe('evaluateReadTribeScope', () => {
  it('denies anonymous for all tribe scopes', () => {
    expect(evaluateReadTribeScope(anonymousViewer(), 'tribe', 'tribe-1')).toEqual({ allowed: false, reason: 'not_character_resolved' });
  });

  it('denies character without tribe', () => {
    expect(evaluateReadTribeScope(characterViewer(), 'tribe', 'tribe-1')).toEqual({ allowed: false, reason: 'tribe_missing' });
  });

  it('denies cross-tribe reads', () => {
    expect(evaluateReadTribeScope(characterViewer('tribe-b'), 'tribe', 'tribe-a')).toEqual({ allowed: false, reason: 'tribe_mismatch' });
  });

  it('allows tribe scope for same tribe member', () => {
    expect(evaluateReadTribeScope(characterViewer('tribe-a'), 'tribe', 'tribe-a')).toEqual({ allowed: true });
  });

  it('allows officer scope for officer of same tribe', () => {
    expect(evaluateReadTribeScope(characterViewer('tribe-a', ['officer']), 'officer', 'tribe-a')).toEqual({ allowed: true });
  });

  it('denies officer scope for non-officer of same tribe', () => {
    expect(evaluateReadTribeScope(characterViewer('tribe-a'), 'officer', 'tribe-a')).toEqual({ allowed: false, reason: 'officer_role_missing' });
  });

  it('denies scout_cell scope even for scout (09A)', () => {
    expect(evaluateReadTribeScope(characterViewer('tribe-a', ['scout']), 'scout_cell', 'tribe-a')).toEqual({ allowed: false, reason: 'cell_identity_missing' });
  });

  it('denies officer from different tribe even with officer role', () => {
    expect(evaluateReadTribeScope(characterViewer('tribe-b', ['officer']), 'officer', 'tribe-a')).toEqual({ allowed: false, reason: 'tribe_mismatch' });
  });
});

describe('evaluateExportTribeScope', () => {
  it('mirrors read policy', () => {
    expect(evaluateExportTribeScope(characterViewer('tribe-a'), 'tribe', 'tribe-a')).toEqual({ allowed: true });
    expect(evaluateExportTribeScope(characterViewer('tribe-b'), 'tribe', 'tribe-a')).toEqual({ allowed: false, reason: 'tribe_mismatch' });
  });
});

describe('getLockedTribeScopes', () => {
  it('returns all locked for anonymous', () => {
    const locked = getLockedTribeScopes(anonymousViewer());
    expect(locked).toHaveLength(3);
    expect(locked.every((l) => l.reason === 'tribe_missing')).toBe(true);
  });

  it('returns officer/scout locked for member with no roles', () => {
    const locked = getLockedTribeScopes(characterViewer('tribe-1'));
    expect(locked.some((l) => l.scope === 'officer')).toBe(true);
    expect(locked.some((l) => l.scope === 'scout_cell')).toBe(true);
  });

  it('returns scout_cell locked for officer', () => {
    const locked = getLockedTribeScopes(characterViewer('tribe-1', ['officer']));
    expect(locked.some((l) => l.scope === 'scout_cell' && l.reason === 'cell_identity_missing')).toBe(true);
  });
});
