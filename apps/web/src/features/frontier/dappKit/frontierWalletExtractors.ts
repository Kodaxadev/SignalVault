function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function extractWalletAddress(raw: unknown): string | undefined {
  if (!isObject(raw)) return undefined;
  // Try common property names
  const account = raw['account'];
  if (typeof account === 'string' && account.startsWith('0x')) return account;
  const address = raw['address'];
  if (typeof address === 'string' && address.startsWith('0x')) return address;
  return undefined;
}

export function extractConnectionSource(raw: unknown): string | undefined {
  if (!isObject(raw)) return undefined;
  const source = raw['source'];
  return typeof source === 'string' ? source : undefined;
}
