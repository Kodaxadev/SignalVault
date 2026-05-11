import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { FrontierCharacterSnapshot } from '@/features/frontier/character/frontierCharacterTypes';

/**
 * Pure function: upgrades a wallet_connected viewer to character_resolved.
 *
 * Rules:
 * - Only works when viewer.state === 'wallet_connected'
 * - Only works when snapshot.status === 'resolved'
 * - Wallet address must match between viewer and snapshot
 * - Always returns explicit object — never spreads viewer
 * - roles: [] always (no role inference)
 * - assemblyOwner NOT used unless wallet match proven (handled upstream)
 */
export function resolveFrontierCharacter(
  viewer: ViewerContext,
  snapshot: FrontierCharacterSnapshot,
): ViewerContext {
  if (viewer.state !== 'wallet_connected') return viewer;
  if (snapshot.status !== 'resolved') return viewer;
  if (viewer.walletAddress !== snapshot.walletAddress) return viewer;

  return {
    state: 'character_resolved',
    walletAddress: viewer.walletAddress,
    characterId: snapshot.characterId,
    characterObjectId: snapshot.characterObjectId,
    characterName: snapshot.characterName,
    tribeId: snapshot.tribeId,
    tribeName: snapshot.tribeName,
    roles: [],
    canWriteShared: true,
    canReadScopes: snapshot.tribeId
      ? (['public', 'private', 'tribe'] as const)
      : (['public', 'private'] as const),
  };
}
