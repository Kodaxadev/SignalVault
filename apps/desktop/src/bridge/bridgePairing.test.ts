import { describe, expect, it, vi } from "vitest";
import {
  formatBridgePairingToken,
  getBridgePairingToken,
} from "./bridgePairing";

describe("bridgePairing", () => {
  it("loads the pairing token from Tauri", async () => {
    const invoke = vi.fn().mockResolvedValue("a".repeat(64));

    const result = await getBridgePairingToken(invoke);

    expect(result).toEqual({ status: "paired", token: "a".repeat(64) });
  });

  it("reports unavailable when the token command fails", async () => {
    const invoke = vi.fn().mockRejectedValue(new Error("missing"));

    const result = await getBridgePairingToken(invoke);

    expect(result).toEqual({ status: "unavailable" });
  });

  it("formats a paired token for manual pairing display", () => {
    expect(formatBridgePairingToken({ status: "paired", token: "a".repeat(64) }))
      .toBe("a".repeat(64));
  });
});
