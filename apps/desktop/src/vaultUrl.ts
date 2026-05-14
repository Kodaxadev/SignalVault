export const defaultVaultUrl = "http://localhost:5173/app";

interface VaultUrlEnv {
  readonly VITE_SIGNAL_VAULT_WEB_URL?: string;
}

export function getConfiguredVaultUrl(env: VaultUrlEnv = readViteEnv()): string {
  const configuredUrl = env.VITE_SIGNAL_VAULT_WEB_URL?.trim();
  if (configuredUrl && isValidVaultUrl(configuredUrl)) {
    return configuredUrl;
  }

  return defaultVaultUrl;
}

function readViteEnv(): VaultUrlEnv {
  return (import.meta as unknown as { env?: VaultUrlEnv }).env ?? {};
}

export function isValidVaultUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
