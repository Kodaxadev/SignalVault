import { describe, it, expect } from 'vitest';
import type { ViewerContext } from '@/features/viewer';
import { checkTribeVaultReadiness } from './tribeVaultReadiness';

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
  tribeName: tribeId ? 'Test Tribe' : undefined,
  roles,
});

describe('checkTribeVaultReadiness', () => {
  it('not ready for anonymous viewer', () => {
    const result = checkTribeVaultReadiness(anonymousViewer());
    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.reason).toBe('not_character_resolved');
    }
  });

  it('not ready for wallet-connected viewer', () => {
    const result = checkTribeVaultReadiness(walletViewer());
    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.reason).toBe('not_character_resolved');
    }
  });

  it('not ready for character without tribe', () => {
    const result = checkTribeVaultReadiness(characterViewer());
    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.reason).toBe('tribe_missing');
    }
  });

  it('ready for character with tribe and no roles, with warnings', () => {
    const result = checkTribeVaultReadiness(characterViewer('tribe-1'));
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.availableScopes).toEqual(['tribe']);
      expect(result.lockedScopes.some((l) => l.scope === 'officer')).toBe(true);
      expect(result.lockedScopes.some((l) => l.scope === 'scout_cell')).toBe(true);
      expect(result.warnings.some((w) => w.includes('Officer/scout scopes locked'))).toBe(true);
    }
  });

  it('ready for officer with tribe and officer scopes', () => {
    const result = checkTribeVaultReadiness(characterViewer('tribe-1', ['officer']));
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.availableScopes).toEqual(['tribe', 'officer']);
      expect(result.lockedScopes.some((l) => l.scope === 'scout_cell')).toBe(true);
    }
  });

  it('ready for scout with tribe but scout_cell locked', () => {
    const result = checkTribeVaultReadiness(characterViewer('tribe-1', ['scout']));
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.availableScopes).toEqual(['tribe']);
      expect(result.lockedScopes.some((l) => l.scope === 'scout_cell' && l.reason === 'cell_identity_missing')).toBe(true);
    }
  });
});
