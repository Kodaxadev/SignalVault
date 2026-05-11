import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useFrontierWalletAdapter } from './useFrontierWalletAdapter';
import * as dappKit from '@evefrontier/dapp-kit';

vi.mock('@evefrontier/dapp-kit', () => ({
  useConnection: vi.fn(),
}));

const mockUseConnection = vi.mocked(dappKit.useConnection);

function renderHookInAdapter() {
  return renderHook(() => useFrontierWalletAdapter(), {
    wrapper: ({ children }: { children: ReactNode }) => children as ReactNode,
  });
}

describe('useFrontierWalletAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unavailable/provider_missing when useConnection throws', () => {
    mockUseConnection.mockImplementation(() => {
      throw new Error('useConnection must be used within EveFrontierProvider');
    });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      reason: 'provider_missing',
    });
  });

  it('returns unavailable/provider_missing when connection is null', () => {
    mockUseConnection.mockReturnValue(null as unknown as { isConnected: boolean });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      reason: 'provider_missing',
    });
  });

  it('returns unavailable/not_connected when isConnected is false', () => {
    mockUseConnection.mockReturnValue({ isConnected: false });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      reason: 'not_connected',
    });
  });

  it('returns unavailable/unknown when isConnected but no wallet address', () => {
    mockUseConnection.mockReturnValue({ isConnected: true, account: undefined });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      reason: 'unknown',
    });
  });

  it('returns connected when isConnected and account is present', () => {
    mockUseConnection.mockReturnValue({ isConnected: true, account: '0x1234abcd' });

    const { result } = renderHookInAdapter();
    expect(result.current).toMatchObject({
      status: 'connected',
      walletAddress: '0x1234abcd',
    });
  });

  it('extracts address from account field with 0x prefix', () => {
    mockUseConnection.mockReturnValue({ isConnected: true, account: '0xabc123' });

    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('connected');
    if (result.current.status === 'connected') {
      expect(result.current.walletAddress).toBe('0xabc123');
    }
  });
});
