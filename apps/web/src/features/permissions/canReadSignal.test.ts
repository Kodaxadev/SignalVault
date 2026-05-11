import { describe, it, expect } from 'vitest';
import type { ViewerContext } from '@/features/viewer';
import type { SignalStub } from '@/features/permissions';
import {
  canReadSignal,
  canCreateSignal,
  canUpdateSignal,
  canDeleteSignal,
  canChangeVisibility,
  canExportSignal,
} from '@/features/permissions';

// Viewer factories
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
const officerViewer = (): ViewerContext =>
  characterViewer('tribe-a', ['officer']);
const scoutViewer = (): ViewerContext =>
  characterViewer('tribe-a', ['scout']);

// Signal factories
const localSignal = (): SignalStub => ({
  visibility: 'local_private',
  author: { kind: 'anonymous_local' },
});
const privateSignal = (wallet = '0xwallet'): SignalStub => ({
  visibility: 'private',
  author: { kind: 'wallet', walletAddress: wallet },
});
const publicSignal = (wallet = '0xwallet'): SignalStub => ({
  visibility: 'public',
  author: { kind: 'character', walletAddress: wallet },
});
const tribeSignal = (tribeId = 'tribe-a'): SignalStub => ({
  visibility: 'tribe',
  author: { kind: 'character', tribeId },
});
const officerSignal = (): SignalStub => ({
  visibility: 'officer',
  author: { kind: 'character', tribeId: 'tribe-a' },
});
const scoutSignal = (): SignalStub => ({
  visibility: 'scout_cell',
  author: { kind: 'character', tribeId: 'tribe-a' },
});

describe('canReadSignal', () => {
  it('anonymous can read public signals', () => {
    expect(canReadSignal(anonymousViewer(), publicSignal())).toBe(true);
  });

  it('anonymous cannot read private signals', () => {
    expect(canReadSignal(anonymousViewer(), privateSignal())).toBe(false);
  });

  it('anonymous cannot read tribe signals', () => {
    expect(canReadSignal(anonymousViewer(), tribeSignal())).toBe(false);
  });

  it('wallet viewer can read own private signals', () => {
    expect(canReadSignal(walletViewer(), privateSignal('0xwallet'))).toBe(true);
  });

  it('wallet viewer cannot read other private signals', () => {
    expect(canReadSignal(walletViewer(), privateSignal('0xother'))).toBe(false);
  });

  it('character can read own tribe signals', () => {
    expect(canReadSignal(characterViewer('tribe-a'), tribeSignal('tribe-a'))).toBe(true);
  });

  it('character cannot read other tribe signals', () => {
    expect(canReadSignal(characterViewer('tribe-b'), tribeSignal('tribe-a'))).toBe(false);
  });

  it('officer can read officer signals', () => {
    expect(canReadSignal(officerViewer(), officerSignal())).toBe(true);
  });

  it('non-officer cannot read officer signals', () => {
    expect(canReadSignal(characterViewer('tribe-a'), officerSignal())).toBe(false);
  });

  it('scout cannot read scout_cell signals in 09A (cell identity missing)', () => {
    // Phase 09A: scout_cell locked unless cell identity exists
    expect(canReadSignal(scoutViewer(), scoutSignal())).toBe(false);
  });

  it('non-scout cannot read scout_cell signals', () => {
    expect(canReadSignal(characterViewer('tribe-a'), scoutSignal())).toBe(false);
  });
});

describe('canCreateSignal', () => {
  it('anonymous cannot publish shared signals', () => {
    const anon = anonymousViewer();
    expect(canCreateSignal(anon, 'tribe')).toBe(false);
    expect(canCreateSignal(anon, 'officer')).toBe(false);
    expect(canCreateSignal(anon, 'scout_cell')).toBe(false);
    expect(canCreateSignal(anon, 'public')).toBe(false);
    expect(canCreateSignal(anon, 'private')).toBe(false);
  });

  it('anonymous can create local_private signals', () => {
    expect(canCreateSignal(anonymousViewer(), 'local_private')).toBe(true);
  });

  it('wallet can create private and public signals', () => {
    const wallet = walletViewer();
    expect(canCreateSignal(wallet, 'private')).toBe(true);
    expect(canCreateSignal(wallet, 'public')).toBe(true);
  });

  it('wallet cannot publish tribe signals', () => {
    expect(canCreateSignal(walletViewer(), 'tribe')).toBe(false);
  });

  it('character can publish shared signals if tribe resolved', () => {
    const char = characterViewer('tribe-a');
    expect(canCreateSignal(char, 'tribe')).toBe(true);
  });

  it('officer can create officer signals', () => {
    expect(canCreateSignal(officerViewer(), 'officer')).toBe(true);
  });

  it('scout cannot create scout_cell signals in 09A (cell identity missing)', () => {
    // Phase 09A: scout_cell locked unless cell identity exists
    expect(canCreateSignal(scoutViewer(), 'scout_cell')).toBe(false);
  });

  it('non-scout cannot create scout_cell signals', () => {
    expect(canCreateSignal(characterViewer('tribe-a'), 'scout_cell')).toBe(false);
  });
});

describe('canUpdateSignal', () => {
  it('owner can update own private signal', () => {
    expect(canUpdateSignal(walletViewer(), privateSignal('0xwallet'))).toBe(true);
  });

  it('non-owner cannot update private signal', () => {
    const otherWallet = { ...walletViewer(), walletAddress: '0xother' };
    expect(canUpdateSignal(otherWallet, privateSignal('0xwallet'))).toBe(false);
  });

  it('officer can update tribe signal', () => {
    expect(canUpdateSignal(officerViewer(), tribeSignal('tribe-a'))).toBe(true);
  });

  it('non-officer cannot update tribe signal', () => {
    expect(canUpdateSignal(characterViewer('tribe-a'), tribeSignal('tribe-a'))).toBe(false);
  });
});

describe('canDeleteSignal', () => {
  it('owner can delete own private signal', () => {
    expect(canDeleteSignal(walletViewer(), privateSignal('0xwallet'))).toBe(true);
  });

  it('officer can delete tribe signal', () => {
    expect(canDeleteSignal(officerViewer(), tribeSignal('tribe-a'))).toBe(true);
  });

  it('non-officer cannot delete tribe signal', () => {
    expect(canDeleteSignal(characterViewer('tribe-a'), tribeSignal('tribe-a'))).toBe(false);
  });
});

describe('canChangeVisibility', () => {
  it('owner can change visibility of own signal', () => {
    expect(canChangeVisibility(walletViewer(), privateSignal('0xwallet'), 'public')).toBe(true);
  });

  it('anonymous local cannot change visibility', () => {
    expect(canChangeVisibility(anonymousViewer(), localSignal(), 'private')).toBe(false);
  });

  it('officer can change visibility of tribe signal', () => {
    expect(canChangeVisibility(officerViewer(), tribeSignal('tribe-a'), 'private')).toBe(true);
  });
});

describe('canExportSignal', () => {
  it('anyone can export local_private', () => {
    expect(canExportSignal(anonymousViewer(), localSignal())).toBe(true);
  });

  it('owner can export own private signal', () => {
    expect(canExportSignal(walletViewer(), privateSignal('0xwallet'))).toBe(true);
  });

  it('character can export own tribe signal', () => {
    // Phase 09A: any tribe member can export tribe-scoped signals from their own tribe
    expect(canExportSignal(characterViewer('tribe-a'), tribeSignal('tribe-a'))).toBe(true);
  });

  it('character cannot export other tribe signal', () => {
    expect(canExportSignal(characterViewer('tribe-b'), tribeSignal('tribe-a'))).toBe(false);
  });
});
