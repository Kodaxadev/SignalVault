export const companionBridgeTokenStorageKey = 'signalVault.companionBridgeToken';

export function loadCompanionBridgeToken(
  storage: Pick<Storage, 'getItem'> = localStorage,
): string | null {
  try {
    const token = storage.getItem(companionBridgeTokenStorageKey)?.trim();
    return token && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

export function saveCompanionBridgeToken(
  token: string,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(companionBridgeTokenStorageKey, token.trim());
}
