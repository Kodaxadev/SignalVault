import { useConnection } from '@evefrontier/dapp-kit';
import { extractWalletAddress } from './frontierWalletExtractors';
import type { WalletSigningSnapshot } from './walletSigningTypes';

// Adapts EVE Frontier dApp Kit connection into a normalized signing snapshot.
//
// Signing API detection: dApp Kit exposes signing through the connection object.
// Properties checked: 'signPersonalMessage', 'signMessage' — the canonical
// name is confirmed once EVE Frontier dApp Kit signing docs are available.
// Returns 'signing_not_supported' if neither is found, rather than throwing.
//
// This hook MUST remain in features/frontier/dappKit. It imports from
// @evefrontier/dapp-kit and must not be called outside the InGameRoute chunk.
export function useWalletSigningAdapter(): WalletSigningSnapshot {
  try {
    const connection = useConnection();

    if (!connection || typeof connection !== 'object') {
      return { status: 'unavailable', reason: 'provider_missing' };
    }

    const isConnected = (connection as Record<string, unknown>)['isConnected'] === true;
    if (!isConnected) {
      return { status: 'unavailable', reason: 'wallet_not_connected' };
    }

    const address = extractWalletAddress(connection);
    if (!address) {
      return { status: 'unavailable', reason: 'unknown' };
    }

    const conn = connection as Record<string, unknown>;
    const rawSign = conn['signPersonalMessage'] ?? conn['signMessage'];
    if (typeof rawSign !== 'function') {
      return { status: 'unavailable', reason: 'signing_not_supported' };
    }

    return {
      status: 'available',
      walletAddress: address,
      signMessage: async (message: string): Promise<string> => {
        const result = await (rawSign as (m: string) => Promise<unknown>)(message);
        if (typeof result === 'string') return result;
        if (result && typeof result === 'object' && 'signature' in result) {
          return String((result as Record<string, unknown>)['signature']);
        }
        throw new Error('Unexpected signPersonalMessage response shape from dApp Kit');
      },
    };
  } catch (err) {
    return {
      status: 'unavailable',
      reason: 'provider_missing',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
