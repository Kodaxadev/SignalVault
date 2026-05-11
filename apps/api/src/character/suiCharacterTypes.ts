export interface SuiPlayerProfile {
  objectAddress: string;
  /** Sui object address of the Character shared object — NOT the EVE numeric ID */
  characterObjectId: string;
  /** Package ID detected dynamically from type repr — never hardcoded */
  packageId: string;
}

export interface SuiCharacter {
  characterObjectId: string;
  /** Character.key.item_id — the EVE numeric character ID (e.g. "2112089652") */
  characterItemId: string;
  /** Character.metadata.name — display name */
  characterName: string;
  /** Character.tribe_id — numeric EVE tribe ID */
  tribeId: number;
  /** Character.character_address — must match the verified wallet address */
  characterAddress: string;
  /** Character.key.tenant — e.g. "stillness" or "utopia" */
  tenant: string;
}

export type SuiCharacterResolutionError =
  | 'no_player_profile'
  | 'character_object_not_found'
  | 'wallet_address_mismatch'
  | 'malformed_response'
  | 'graphql_error'
  | 'network_error';

export type SuiCharacterResolutionResult =
  | { ok: true; profile: SuiPlayerProfile; character: SuiCharacter }
  | { ok: false; reason: SuiCharacterResolutionError; detail?: string };
