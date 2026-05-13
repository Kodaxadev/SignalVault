import { describe, expect, it } from "vitest";
import { formatBridgeStatus } from "./bridgeStatus";

describe("formatBridgeStatus", () => {
  it("shows connected copy", () => {
    expect(formatBridgeStatus("connected")).toBe("Bridge: connected");
  });

  it("shows disconnected fallback copy", () => {
    expect(formatBridgeStatus("disconnected")).toBe(
      "Bridge: disconnected - Open Signal Vault in browser to provide live state.",
    );
  });
});
