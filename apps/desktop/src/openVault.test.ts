import { describe, expect, it, vi } from "vitest";
import { openVault } from "./openVault";

describe("openVault", () => {
  it("opens the configured Signal Vault URL", async () => {
    const opener = vi.fn().mockResolvedValue(undefined);

    const result = await openVault(opener, "http://localhost:5173/app");

    expect(result).toEqual({ status: "opened" });
    expect(opener).toHaveBeenCalledWith("http://localhost:5173/app");
  });

  it("reports invalid URLs without opening", async () => {
    const opener = vi.fn();

    const result = await openVault(opener, "javascript:alert(1)");

    expect(result).toEqual({ status: "invalid_url" });
    expect(opener).not.toHaveBeenCalled();
  });

  it("reports open failures", async () => {
    const opener = vi.fn().mockRejectedValue(new Error("blocked"));

    const result = await openVault(opener, "http://localhost:5173/app");

    expect(result).toEqual({ status: "failed" });
  });
});
