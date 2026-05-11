import type { SuiPlayerProfile, SuiCharacter } from './suiCharacterTypes';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value !== null && typeof value === 'object') return value as Record<string, unknown>;
  return undefined;
}

/**
 * Scans an array of wallet-owned objects for a PlayerProfile Move object.
 * Package ID is extracted from the type repr — never hardcoded.
 *
 * Confirmed Sui GraphQL shape (from live Stillness probe 2026-05-11):
 *   nodes[].address
 *   nodes[].contents.type.repr  → "<PKG>::character::PlayerProfile"
 *   nodes[].contents.json.character_id  → Sui object address of Character
 */
export function extractPlayerProfile(nodes: unknown): SuiPlayerProfile | null {
  if (!Array.isArray(nodes)) return null;

  for (const node of nodes) {
    const nodeObj = asRecord(node);
    const contents = asRecord(nodeObj?.['contents']);
    const typeObj = asRecord(contents?.['type']);
    const repr = typeObj?.['repr'];

    if (typeof repr !== 'string') continue;
    if (!repr.includes('::character::PlayerProfile')) continue;

    const packageId = repr.split('::')[0];
    const objectAddress = nodeObj?.['address'];
    const jsonObj = asRecord(contents?.['json']);
    const characterObjectId = jsonObj?.['character_id'];

    if (
      typeof packageId !== 'string' ||
      typeof objectAddress !== 'string' ||
      typeof characterObjectId !== 'string'
    ) {
      return null;
    }

    return { objectAddress, characterObjectId, packageId };
  }

  return null;
}

/**
 * Extracts EVE character identity from a Character shared object response.
 *
 * Confirmed Sui GraphQL shape (from live Stillness probe 2026-05-11):
 *   object.address
 *   object.asMoveObject.contents.json.key.item_id     → EVE numeric character ID
 *   object.asMoveObject.contents.json.metadata.name   → character display name
 *   object.asMoveObject.contents.json.tribe_id        → numeric tribe ID
 *   object.asMoveObject.contents.json.character_address → wallet binding
 *   object.asMoveObject.contents.json.key.tenant      → "stillness" | "utopia"
 *
 * NOTE: character_id in PlayerProfile is a Sui object address pointing here.
 *       The EVE numeric ID is Character.key.item_id, not character_id.
 */
export function extractCharacter(objectData: unknown): SuiCharacter | null {
  const root = asRecord(objectData);
  const obj = asRecord(root?.['object']);
  const characterObjectId = obj?.['address'];
  const moveObj = asRecord(obj?.['asMoveObject']);
  const contents = asRecord(moveObj?.['contents']);
  const json = asRecord(contents?.['json']);

  if (typeof characterObjectId !== 'string' || !json) return null;

  const key = asRecord(json['key']);
  const metadata = asRecord(json['metadata']);

  const characterItemId = key?.['item_id'];
  const tenant = key?.['tenant'];
  const characterName = metadata?.['name'];
  const tribeId = json['tribe_id'];
  const characterAddress = json['character_address'];

  if (
    typeof characterItemId !== 'string' ||
    typeof tenant !== 'string' ||
    typeof characterName !== 'string' ||
    typeof tribeId !== 'number' ||
    typeof characterAddress !== 'string'
  ) {
    return null;
  }

  return {
    characterObjectId,
    characterItemId,
    characterName,
    tribeId,
    characterAddress,
    tenant,
  };
}
