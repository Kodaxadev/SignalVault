import { openUrl } from "@tauri-apps/plugin-opener";
import { getConfiguredVaultUrl, isValidVaultUrl } from "./vaultUrl";

export type OpenVaultResult =
  | { status: "opened" }
  | { status: "invalid_url" }
  | { status: "failed" };

type OpenUrl = (url: string) => Promise<void>;

export async function openVault(
  opener: OpenUrl = openUrl,
  url = getConfiguredVaultUrl(),
): Promise<OpenVaultResult> {
  if (!isValidVaultUrl(url)) {
    return { status: "invalid_url" };
  }

  try {
    await opener(url);
    return { status: "opened" };
  } catch {
    return { status: "failed" };
  }
}
