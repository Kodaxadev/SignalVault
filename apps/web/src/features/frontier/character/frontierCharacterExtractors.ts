/**
 * Defensive extractors for raw character/profile data from dApp Kit.
 * Each uses typeof guards and safe property access — no assumptions about shape.
 */

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

export function extractCharacterId(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  return getString(raw, 'characterId') ?? getString(raw, 'id') ?? undefined;
}

export function extractCharacterName(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  return getString(raw, 'characterName') ?? getString(raw, 'name') ?? undefined;
}

export function extractCharacterObjectId(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  return getString(raw, 'characterObjectId') ?? getString(raw, 'objectId') ?? undefined;
}

export function extractTribeId(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  return getString(raw, 'tribeId') ?? getString(raw, 'tribe') ?? undefined;
}

export function extractTribeName(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  return getString(raw, 'tribeName') ?? undefined;
}

export function extractWalletFromCharacter(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  return getString(raw, 'walletAddress') ?? getString(raw, 'wallet') ?? getString(raw, 'address') ?? undefined;
}
