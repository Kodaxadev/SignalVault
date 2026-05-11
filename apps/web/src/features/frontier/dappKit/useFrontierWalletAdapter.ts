import { useConnection } from '@evefrontier/dapp-kit';
import type { FrontierWalletSnapshot } from './frontierWalletTypes';
import { extractWalletAddress, extractConnectionSource } from './frontierWalletExtractors';

export function useFrontierWalletAdapter(): FrontierWalletSnapshot {
  try {
    const connection = useConnection();
    if (!connection || typeof connection !== 'object') {
      return { status: 'unavailable', reason: 'provider_missing' };
    }
    const isConnected = (connection as Record<string, unknown>)['isConnected'] === true;
    if (!isConnected) {
      return { status: 'unavailable', reason: 'not_connected' };
    }
    const address = extractWalletAddress(connection);
    if (!address) {
      return { status: 'unavailable', reason: 'unknown' };
    }
    const sourceRaw = extractConnectionSource(connection);
    const source = sourceRaw === 'sui' ? 'sui_wallet' : 'unknown_wallet';
    return { status: 'connected', walletAddress: address, source, raw: connection };
  } catch {
    return { status: 'unavailable', reason: 'provider_missing' };
  }
}
