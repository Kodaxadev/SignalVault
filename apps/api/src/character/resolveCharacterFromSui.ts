import { suiGraphqlQuery } from './suiGraphqlClient';
import { extractPlayerProfile, extractCharacter } from './suiCharacterExtractors';
import { suiEnv } from './suiEnv';
import type { SuiCharacterResolutionResult } from './suiCharacterTypes';

type OwnedObjectsResult = {
  address?: { objects?: { nodes?: unknown[] } };
};

type CharacterObjectResult = {
  object?: unknown;
};

function ownedObjectsQuery(walletAddress: string): string {
  return `{
    address(address: "${walletAddress}") {
      objects(first: 50) {
        nodes {
          address
          contents {
            type { repr }
            json
          }
        }
      }
    }
  }`;
}

function characterObjectQuery(characterObjectId: string): string {
  return `{
    object(address: "${characterObjectId}") {
      address
      asMoveObject {
        contents {
          type { repr }
          json
        }
      }
    }
  }`;
}

/**
 * Resolves a verified wallet address to EVE character identity via two Sui GraphQL calls:
 *   1. wallet → PlayerProfile (wallet-owned Move object) → character_id
 *   2. character_id → Character (shared Move object) → item_id, name, tribe_id
 *
 * Requires Character.character_address to match the verified wallet address.
 * Package ID is never hardcoded — detected dynamically from the PlayerProfile type repr.
 *
 * @param walletAddress - The server-verified wallet address (from signature check)
 * @param endpoint - Sui GraphQL endpoint (defaults to suiEnv.suiGraphqlUrl)
 */
export async function resolveCharacterFromSui(
  walletAddress: string,
  endpoint: string = suiEnv.suiGraphqlUrl
): Promise<SuiCharacterResolutionResult> {
  // ── Step 1: find PlayerProfile owned by this wallet ──────────────────────
  let ownedData: Awaited<ReturnType<typeof suiGraphqlQuery<OwnedObjectsResult>>>;
  try {
    ownedData = await suiGraphqlQuery<OwnedObjectsResult>(
      endpoint,
      ownedObjectsQuery(walletAddress)
    );
  } catch (err) {
    return { ok: false, reason: 'network_error', detail: String(err) };
  }

  if (ownedData.errors && ownedData.errors.length > 0) {
    return {
      ok: false,
      reason: 'graphql_error',
      detail: ownedData.errors[0]?.message,
    };
  }

  const nodes = ownedData.data?.address?.objects?.nodes;

  const profile = extractPlayerProfile(nodes);
  if (!profile) {
    return { ok: false, reason: 'no_player_profile' };
  }

  // ── Step 2: resolve Character shared object via character_id ─────────────
  let characterData: Awaited<ReturnType<typeof suiGraphqlQuery<CharacterObjectResult>>>;
  try {
    characterData = await suiGraphqlQuery<CharacterObjectResult>(
      endpoint,
      characterObjectQuery(profile.characterObjectId)
    );
  } catch (err) {
    return { ok: false, reason: 'network_error', detail: String(err) };
  }

  if (characterData.errors && characterData.errors.length > 0) {
    return {
      ok: false,
      reason: 'graphql_error',
      detail: characterData.errors[0]?.message,
    };
  }

  const character = extractCharacter(characterData.data);
  if (!character) {
    return { ok: false, reason: 'character_object_not_found' };
  }

  // ── Step 3: verify wallet binding ────────────────────────────────────────
  if (character.characterAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return { ok: false, reason: 'wallet_address_mismatch' };
  }

  return { ok: true, profile, character };
}
