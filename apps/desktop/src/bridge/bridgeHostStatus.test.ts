import { describe, expect, it } from "vitest";
import { formatBridgeHostStatus } from "./bridgeHostStatus";

describe("formatBridgeHostStatus", () => {
  it("shows running bridge host copy", () => {
    expect(formatBridgeHostStatus("running")).toBe("running");
  });

  it("shows visible port conflict copy", () => {
    expect(formatBridgeHostStatus("port_conflict")).toBe(
      "port conflict on 127.0.0.1:17777",
    );
  });

  it("shows safe fallback copy for startup failures", () => {
    expect(formatBridgeHostStatus("failed")).toBe("failed");
  });
});
