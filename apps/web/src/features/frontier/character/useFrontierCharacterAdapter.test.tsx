import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFrontierCharacterAdapter } from '@/features/frontier/character/useFrontierCharacterAdapter';
import * as dappKit from '@evefrontier/dapp-kit';
import { vi } from 'vitest';
import React from 'react';

// Wrap in a minimal provider for React 19
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

describe('useFrontierCharacterAdapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns provider_missing when useConnection returns null', () => {
    vi.spyOn(dappKit, 'useConnection').mockReturnValue(null as unknown as ReturnType<typeof dappKit.useConnection>);
    vi.spyOn(dappKit, 'useSmartObject').mockReturnValue({
      tenant: '',
      assembly: null,
      assemblyOwner: null,
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderHook(() => useFrontierCharacterAdapter(), { wrapper });
    expect(result.current).toEqual({ status: 'unavailable', reason: 'provider_missing' });
  });

  it('returns wallet_not_connected when isConnected is false', () => {
    vi.spyOn(dappKit, 'useConnection').mockReturnValue({ isConnected: false });
    vi.spyOn(dappKit, 'useSmartObject').mockReturnValue({
      tenant: '',
      assembly: null,
      assemblyOwner: null,
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderHook(() => useFrontierCharacterAdapter(), { wrapper });
    expect(result.current).toEqual({ status: 'unavailable', reason: 'wallet_not_connected' });
  });

  it('returns wallet_not_connected when account is missing', () => {
    vi.spyOn(dappKit, 'useConnection').mockReturnValue({ isConnected: true });
    vi.spyOn(dappKit, 'useSmartObject').mockReturnValue({
      tenant: '',
      assembly: null,
      assemblyOwner: null,
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderHook(() => useFrontierCharacterAdapter(), { wrapper });
    expect(result.current).toEqual({ status: 'unavailable', reason: 'wallet_not_connected' });
  });

  it('returns resolver_unavailable when wallet connected but no character data', () => {
    vi.spyOn(dappKit, 'useConnection').mockReturnValue({ isConnected: true, account: '0xabc' });
    vi.spyOn(dappKit, 'useSmartObject').mockReturnValue({
      tenant: '',
      assembly: null,
      assemblyOwner: null,
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderHook(() => useFrontierCharacterAdapter(), { wrapper });
    expect(result.current).toEqual({ status: 'unavailable', reason: 'resolver_unavailable' });
  });

  it('resolves from assembly_owner_candidate when wallet matches', () => {
    vi.spyOn(dappKit, 'useConnection').mockReturnValue({ isConnected: true, account: '0xabc' });
    vi.spyOn(dappKit, 'useSmartObject').mockReturnValue({
      tenant: 'test',
      assembly: null,
      assemblyOwner: {
        characterId: 'char-owner',
        characterName: 'Assembly Owner',
        walletAddress: '0xabc',
        tribeId: 'tribe-001',
        tribeName: 'Owner Tribe',
      },
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderHook(() => useFrontierCharacterAdapter(), { wrapper });
    expect(result.current.status).toBe('resolved');
    if (result.current.status === 'resolved') {
      expect(result.current.source).toBe('assembly_owner_candidate');
      expect(result.current.walletAddress).toBe('0xabc');
      expect(result.current.characterId).toBe('char-owner');
      expect(result.current.characterName).toBe('Assembly Owner');
      expect(result.current.tribeId).toBe('tribe-001');
    }
  });

  it('does NOT resolve from assemblyOwner when wallet does not match', () => {
    vi.spyOn(dappKit, 'useConnection').mockReturnValue({ isConnected: true, account: '0xabc' });
    vi.spyOn(dappKit, 'useSmartObject').mockReturnValue({
      tenant: 'test',
      assembly: null,
      assemblyOwner: {
        characterId: 'char-owner',
        walletAddress: '0xdifferent',
      },
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderHook(() => useFrontierCharacterAdapter(), { wrapper });
    expect(result.current).toEqual({ status: 'unavailable', reason: 'resolver_unavailable' });
  });
});
