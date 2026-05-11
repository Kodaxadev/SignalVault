import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useWalletSigningAdapter } from './useWalletSigningAdapter';
import * as dappKit from '@evefrontier/dapp-kit';

vi.mock('@evefrontier/dapp-kit', () => ({
  useConnection: vi.fn(),
}));

const mockUseConnection = vi.mocked(dappKit.useConnection);

function renderHookInAdapter() {
  return renderHook(() => useWalletSigningAdapter(), {
    wrapper: ({ children }: { children: ReactNode }) => children as ReactNode,
  });
}

describe('useWalletSigningAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unavailable/provider_missing when useConnection throws', () => {
    mockUseConnection.mockImplementation(() => {
      throw new Error('useConnection must be used within EveFrontierProvider');
    });
    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('unavailable');
    if (result.current.status === 'unavailable') {
      expect(result.current.reason).toBe('provider_missing');
    }
  });

  it('returns unavailable/provider_missing when connection is null', () => {
    mockUseConnection.mockReturnValue(null as unknown as { isConnected: boolean });
    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('unavailable');
  });

  it('returns unavailable/wallet_not_connected when isConnected is false', () => {
    mockUseConnection.mockReturnValue({ isConnected: false });
    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('unavailable');
    if (result.current.status === 'unavailable') {
      expect(result.current.reason).toBe('wallet_not_connected');
    }
  });

  it('returns unavailable/unknown when connected but no wallet address', () => {
    mockUseConnection.mockReturnValue({ isConnected: true, account: undefined });
    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('unavailable');
    if (result.current.status === 'unavailable') {
      expect(result.current.reason).toBe('unknown');
    }
  });

  it('returns unavailable/signing_not_supported when no sign function present', () => {
    mockUseConnection.mockReturnValue({ isConnected: true, account: '0xabc' });
    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('unavailable');
    if (result.current.status === 'unavailable') {
      expect(result.current.reason).toBe('signing_not_supported');
    }
  });

  it('returns available with signMessage when signPersonalMessage is present', async () => {
    const mockSign = vi.fn().mockResolvedValue('sig-result');
    mockUseConnection.mockReturnValue({ isConnected: true, account: '0xabc', signPersonalMessage: mockSign } as unknown as ReturnType<typeof dappKit.useConnection>);

    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('available');
    if (result.current.status === 'available') {
      expect(result.current.walletAddress).toBe('0xabc');
      const sig = await result.current.signMessage('test message');
      expect(sig).toBe('sig-result');
      expect(mockSign).toHaveBeenCalledWith('test message');
    }
  });

  it('returns available with signMessage when signMessage property is present', async () => {
    const mockSign = vi.fn().mockResolvedValue('alt-sig');
    mockUseConnection.mockReturnValue({ isConnected: true, account: '0xabc', signMessage: mockSign } as unknown as ReturnType<typeof dappKit.useConnection>);

    const { result } = renderHookInAdapter();
    expect(result.current.status).toBe('available');
  });

  it('handles object response with signature field', async () => {
    const mockSign = vi.fn().mockResolvedValue({ signature: 'obj-sig' });
    mockUseConnection.mockReturnValue({ isConnected: true, account: '0xabc', signPersonalMessage: mockSign } as unknown as ReturnType<typeof dappKit.useConnection>);

    const { result } = renderHookInAdapter();
    if (result.current.status === 'available') {
      const sig = await result.current.signMessage('msg');
      expect(sig).toBe('obj-sig');
    }
  });
});
