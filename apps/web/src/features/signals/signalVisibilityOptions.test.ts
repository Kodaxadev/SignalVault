import { describe, it, expect } from 'vitest';
import type { ViewerContext } from '@/features/viewer';
import { getAvailableSignalVisibilities } from './signalVisibilityOptions';

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

describe('getAvailableSignalVisibilities', () => {
  it('returns only local_private for anonymous', () => {
    const options = getAvailableSignalVisibilities(anonymousViewer());
    expect(options).toHaveLength(1);
    expect(options[0]!.visibility).toBe('local_private');
    expect(options[0]!.available).toBe(true);
  });

  it('returns private/public for wallet user', () => {
    const options = getAvailableSignalVisibilities(walletViewer());
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.visibility)).toEqual(['private', 'public']);
    expect(options.every((o) => o.available)).toBe(true);
  });

  it('returns all scopes with tribe scopes locked for character without tribe', () => {
    const options = getAvailableSignalVisibilities(characterViewer());
    expect(options).toHaveLength(5);
    expect(options.map((o) => o.visibility)).toEqual(['private', 'public', 'tribe', 'officer', 'scout_cell']);
    expect(options.find((o) => o.visibility === 'tribe')!.available).toBe(false);
    expect(options.find((o) => o.visibility === 'tribe')!.reason).toBe('tribe_missing');
  });

  it('returns tribe scope as available for character with tribe', () => {
    const options = getAvailableSignalVisibilities(characterViewer('tribe-1'));
    const tribeOpt = options.find((o) => o.visibility === 'tribe');
    expect(tribeOpt).toBeDefined();
    expect(tribeOpt!.available).toBe(true);
  });

  it('returns officer scope as available for officer', () => {
    const options = getAvailableSignalVisibilities(characterViewer('tribe-1', ['officer']));
    const officerOpt = options.find((o) => o.visibility === 'officer');
    expect(officerOpt).toBeDefined();
    expect(officerOpt!.available).toBe(true);
  });

  it('returns officer scope as locked for non-officer', () => {
    const options = getAvailableSignalVisibilities(characterViewer('tribe-1'));
    const officerOpt = options.find((o) => o.visibility === 'officer');
    expect(officerOpt).toBeDefined();
    expect(officerOpt!.available).toBe(false);
    expect(officerOpt!.reason).toBe('officer_role_missing');
  });

  it('returns scout_cell as locked with cell_identity_missing', () => {
    const options = getAvailableSignalVisibilities(characterViewer('tribe-1', ['scout']));
    const scoutOpt = options.find((o) => o.visibility === 'scout_cell');
    expect(scoutOpt).toBeDefined();
    expect(scoutOpt!.available).toBe(false);
    expect(scoutOpt!.reason).toBe('cell_identity_missing');
  });
});
