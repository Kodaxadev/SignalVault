function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function extractSmartObjectId(raw: unknown): string | undefined {
  if (!isObject(raw)) return undefined;
  const id = raw['id'];
  return typeof id === 'string' ? id : undefined;
}

export function extractSmartObjectType(raw: unknown): string | undefined {
  if (!isObject(raw)) return undefined;
  const type = raw['type'];
  return typeof type === 'string' ? type : undefined;
}

export function extractSmartObjectName(raw: unknown): string | undefined {
  if (!isObject(raw)) return undefined;
  const name = raw['name'];
  return typeof name === 'string' ? name : undefined;
}
