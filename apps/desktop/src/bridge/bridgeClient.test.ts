import { describe, expect, it } from "vitest";
import { fetchCompanionBridgeState } from "./bridgeClient";

const bridgeState = {
  app: "signal-vault",
  schemaVersion: 1,
  generatedAt: "2026-05-12T00:00:00Z",
  warnings: [],
  latestSignals: [],
};

describe("fetchCompanionBridgeState", () => {
  it("returns connected state for a valid bridge response", async () => {
    const result = await fetchCompanionBridgeState(async () => ({
      ok: true,
      json: async () => bridgeState,
    }));

    expect(result).toEqual({ status: "connected", state: bridgeState });
  });

  it("returns disconnected on network failure", async () => {
    const result = await fetchCompanionBridgeState(async () => {
      throw new Error("offline");
    });

    expect(result).toEqual({ status: "disconnected" });
  });

  it("returns disconnected on invalid state", async () => {
    const result = await fetchCompanionBridgeState(async () => ({
      ok: true,
      json: async () => ({ ...bridgeState, app: "other-app" }),
    }));

    expect(result).toEqual({ status: "disconnected" });
  });
});
