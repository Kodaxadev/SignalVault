import { describe, expect, it } from "vitest";
import {
  defaultVaultUrl,
  getConfiguredVaultUrl,
  isValidVaultUrl,
} from "./vaultUrl";

describe("vaultUrl", () => {
  it("defaults to the local web app route", () => {
    expect(getConfiguredVaultUrl({})).toBe(defaultVaultUrl);
  });

  it("accepts configured http and https app URLs", () => {
    expect(
      getConfiguredVaultUrl({ VITE_SIGNAL_VAULT_WEB_URL: "https://signal-vault.example/app" }),
    ).toBe("https://signal-vault.example/app");
  });

  it("rejects non-web URLs", () => {
    expect(isValidVaultUrl("file:///tmp/vault")).toBe(false);
    expect(isValidVaultUrl("javascript:alert(1)")).toBe(false);
  });
});
