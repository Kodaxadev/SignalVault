import { useConnection, useSmartObject } from '@evefrontier/dapp-kit';
import type { FrontierCharacterSnapshot } from './frontierCharacterTypes';
import {
  extractCharacterId,
  extractCharacterName,
  extractCharacterObjectId,
  extractTribeId,
  extractTribeName,
  extractWalletFromCharacter,
} from './frontierCharacterExtractors';

/**
 * Adapter hook that attempts to resolve character from available dApp Kit data.
 *
 * Phase 07D: Uses only existing stub hooks (useConnection, useSmartObject).
 * No fake hooks added. If no real resolver is available, returns resolver_unavailable.
 *
 * Phase 07D.1: Will wire real character/profile queries once API stabilizes.
 */
export function useFrontierCharacterAdapter(): FrontierCharacterSnapshot {
  try {
    const connection = useConnection();

    // Provider missing
    if (!connection || typeof connection !== 'object') {
      return { status: 'unavailable', reason: 'provider_missing' };
    }

    // Wallet not connected
    const isConnected = (connection as Record<string, unknown>)['isConnected'] === true;
    if (!isConnected) {
      return { status: 'unavailable', reason: 'wallet_not_connected' };
    }

    // Extract wallet address from connection
    const walletAddress = (connection as Record<string, unknown>)['account'] as string | undefined;
    if (!walletAddress) {
      return { status: 'unavailable', reason: 'wallet_not_connected' };
    }

    // Phase 07D: Real resolver not yet available → try assemblyOwner fallback
    const smartObject = useSmartObject();
    if (smartObject && typeof smartObject === 'object' && smartObject.assemblyOwner) {
      const ownerWallet = extractWalletFromCharacter(smartObject.assemblyOwner);
      if (ownerWallet && ownerWallet === walletAddress) {
        // Wallet match — can treat assemblyOwner as viewer candidate
        const characterId = extractCharacterId(smartObject.assemblyOwner);
        if (characterId) {
          return {
            status: 'resolved',
            source: 'assembly_owner_candidate',
            walletAddress,
            characterId,
            characterObjectId: extractCharacterObjectId(smartObject.assemblyOwner),
            characterName: extractCharacterName(smartObject.assemblyOwner),
            tribeId: extractTribeId(smartObject.assemblyOwner),
            tribeName: extractTribeName(smartObject.assemblyOwner),
            raw: smartObject.assemblyOwner,
          };
        }
      }
    }

    // No real resolver available yet
    return { status: 'unavailable', reason: 'resolver_unavailable' };
  } catch {
    return { status: 'unavailable', reason: 'unknown' };
  }
}
