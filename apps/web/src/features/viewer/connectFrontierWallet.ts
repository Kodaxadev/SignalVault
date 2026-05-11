import type { ViewerContext } from './viewerTypes';
import type { FrontierWalletSnapshot } from '@/features/frontier/dappKit/frontierWalletTypes';

export function connectFrontierWallet(
  viewer: ViewerContext,
  snapshot: FrontierWalletSnapshot,
): ViewerContext {
  if (snapshot.status !== 'connected') return viewer;

  return {
    state: 'wallet_connected',
    walletAddress: snapshot.walletAddress,
    roles: viewer.roles,
  };
}
