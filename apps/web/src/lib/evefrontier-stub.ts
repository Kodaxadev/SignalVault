// Stub for @evefrontier/dapp-kit — prevents tsc from type-checking raw .ts in node_modules
// Vite resolves the real package at runtime via its own module resolution.

import type { QueryClient } from '@tanstack/react-query';

export interface SmartObjectContextValue {
  tenant: string;
  assembly: Record<string, unknown> | null;
  assemblyOwner: unknown;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface EveFrontierProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export function EveFrontierProvider(_props: EveFrontierProviderProps): React.ReactNode {
  return undefined as unknown as React.ReactNode;
}

export function useSmartObject(): SmartObjectContextValue {
  return {
    tenant: '',
    assembly: null,
    assemblyOwner: null,
    loading: false,
    error: null,
    refetch: async () => {},
  };
}

export function useConnection(): { isConnected: boolean; account?: string; connect?: () => Promise<void> } {
  return { isConnected: false, account: undefined, connect: undefined };
}
