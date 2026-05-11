import { describe, it, expect } from 'vitest';
import { connectFrontierWallet } from './connectFrontierWallet';
import { anonymousViewer } from './viewerTypes';
import type { FrontierWalletSnapshot } from '@/features/frontier/dappKit/frontierWalletTypes';

describe('connectFrontierWallet', () => {
  it('returns viewer unchanged for unavailable snapshot', () => {
    const viewer = anonymousViewer();
    const snapshot: FrontierWalletSnapshot = {
      status: 'unavailable',
      reason: 'not_connected',
    };
    const result = connectFrontierWallet(viewer, snapshot);
    expect(result).toBe(viewer);
  });

  it('returns viewer unchanged for provider_missing snapshot', () => {
    const viewer = anonymousViewer();
    const snapshot: FrontierWalletSnapshot = {
      status: 'unavailable',
      reason: 'provider_missing',
    };
    const result = connectFrontierWallet(viewer, snapshot);
    expect(result).toBe(viewer);
  });

  it('returns wallet_connected context for connected snapshot', () => {
    const viewer = anonymousViewer('utopia');
    const snapshot: FrontierWalletSnapshot = {
      status: 'connected',
      walletAddress: '0xabc123',
      source: 'eve_vault',
    };
    const result = connectFrontierWallet(viewer, snapshot);
    expect(result.state).toBe('wallet_connected');
    expect(result.walletAddress).toBe('0xabc123');
    expect(result.roles).toEqual([]);
  });

  it('preserves roles from original viewer', () => {
    const viewer: ReturnType<typeof anonymousViewer> = {
      state: 'anonymous',
      roles: ['scout'],
    };
    const snapshot: FrontierWalletSnapshot = {
      status: 'connected',
      walletAddress: '0xdef456',
      source: 'sui_wallet',
    };
    const result = connectFrontierWallet(viewer, snapshot);
    expect(result.roles).toEqual(['scout']);
  });

  it('does not spread anonymous viewer fields into wallet_connected', () => {
    const viewer: ReturnType<typeof anonymousViewer> = {
      state: 'anonymous',
      walletAddress: '0xold-address',
      roles: [],
    };
    const snapshot: FrontierWalletSnapshot = {
      status: 'connected',
      walletAddress: '0xnew-address',
      source: 'eve_vault',
    };
    const result = connectFrontierWallet(viewer, snapshot);
    expect(result.state).toBe('wallet_connected');
    expect(result.walletAddress).toBe('0xnew-address');
    // Must be an explicit object, not a spread
    expect(Object.keys(result)).toEqual(['state', 'walletAddress', 'roles']);
  });
});
