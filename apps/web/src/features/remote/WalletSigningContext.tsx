import { createContext, useContext } from 'react';
import type { WalletSigningSnapshot } from '@/features/frontier/dappKit/walletSigningTypes';

// Default: signing unavailable until a provider wraps the tree.
// InGameShell provides the real snapshot via useWalletSigningAdapter.
// All other contexts (/app, /compat) receive this default — remote push
// via wallet signing is blocked, which is correct outside the InGame route.
const defaultSnapshot: WalletSigningSnapshot = {
  status: 'unavailable',
  reason: 'provider_missing',
};

const WalletSigningContext = createContext<WalletSigningSnapshot>(defaultSnapshot);

export function WalletSigningProvider({
  snapshot,
  children,
}: {
  snapshot: WalletSigningSnapshot;
  children: React.ReactNode;
}) {
  return (
    <WalletSigningContext.Provider value={snapshot}>
      {children}
    </WalletSigningContext.Provider>
  );
}

export function useWalletSigningContext(): WalletSigningSnapshot {
  return useContext(WalletSigningContext);
}
