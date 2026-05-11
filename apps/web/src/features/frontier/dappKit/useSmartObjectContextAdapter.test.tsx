import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useSmartObjectContextAdapter } from './useSmartObjectContextAdapter';
import * as dappKit from '@evefrontier/dapp-kit';

vi.mock('@evefrontier/dapp-kit', () => ({
  useSmartObject: vi.fn(),
}));

const mockUseSmartObject = vi.mocked(dappKit.useSmartObject);

function renderHookInAdapter() {
  return renderHook(() => useSmartObjectContextAdapter(), {
    wrapper: ({ children }: { children: ReactNode }) => children as ReactNode,
  });
}

describe('useSmartObjectContextAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when loading is true', () => {
    mockUseSmartObject.mockReturnValue({
      loading: true,
      error: null,
      assembly: null,
      tenant: '',
      assemblyOwner: null,
      refetch: vi.fn(),
    });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({ status: 'loading', available: false });
  });

  it('returns unavailable with reason unknown when error is present', () => {
    mockUseSmartObject.mockReturnValue({
      loading: false,
      error: 'something broke',
      assembly: null,
      tenant: '',
      assemblyOwner: null,
      refetch: vi.fn(),
    });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      available: false,
      reason: 'unknown',
      error: 'something broke',
    });
  });

  it('returns unavailable with reason no_assembly when assembly is null', () => {
    mockUseSmartObject.mockReturnValue({
      loading: false,
      error: null,
      assembly: null,
      tenant: 'utopia',
      assemblyOwner: null,
      refetch: vi.fn(),
    });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      available: false,
      reason: 'no_assembly',
    });
  });

  it('returns available state when assembly is present', () => {
    const assembly = { id: 'gate-1', type: 'SmartGate', name: 'My Gate' };
    mockUseSmartObject.mockReturnValue({
      loading: false,
      error: null,
      assembly,
      tenant: 'utopia',
      assemblyOwner: null,
      refetch: vi.fn(),
    });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'available',
      available: true,
      tenant: 'utopia',
      objectId: 'gate-1',
      assemblyType: 'SmartGate',
      assemblyName: 'My Gate',
      raw: assembly,
    });
  });

  it('returns unavailable/provider_missing when useSmartObject throws', () => {
    mockUseSmartObject.mockImplementation(() => {
      throw new Error('useSmartObject must be used within EveFrontierProvider');
    });

    const { result } = renderHookInAdapter();
    expect(result.current).toEqual({
      status: 'unavailable',
      available: false,
      reason: 'provider_missing',
    });
  });
});
