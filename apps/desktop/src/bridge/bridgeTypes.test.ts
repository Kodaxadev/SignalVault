import { describe, expect, it } from "vitest";
import { parseCompanionBridgeState } from "./bridgeTypes";

const validState = {
  app: "signal-vault",
  schemaVersion: 1,
  generatedAt: "2026-05-12T00:00:00Z",
  currentSystem: { id: "30000142", name: "OQQ-0R8", source: "world_api" },
  currentSystemStaticIntel: {
    siteCount: 9,
    beltGroups: 3,
    trojanGroups: 2,
    dangerTaggedGroups: 5,
    tags: ["non_zero_danger_level"],
  },
  warnings: [
    {
      id: "warn-1",
      level: "warning",
      title: "Hostile Contact",
      detail: "Recent hostile activity.",
    },
  ],
  latestSignals: [
    {
      id: "sig-1",
      title: "Gate camp",
      type: "hostile_contact",
      confidence: "observed",
      visibility: "tribe",
      createdAt: "2026-05-12T00:00:00Z",
    },
  ],
};

describe("parseCompanionBridgeState", () => {
  it("accepts valid Signal Vault bridge state", () => {
    expect(parseCompanionBridgeState(validState)).toEqual(validState);
  });

  it("rejects the wrong app", () => {
    expect(() =>
      parseCompanionBridgeState({ ...validState, app: "other-app" }),
    ).toThrow("bridge_app_mismatch");
  });

  it("rejects the wrong schema version", () => {
    expect(() =>
      parseCompanionBridgeState({ ...validState, schemaVersion: 2 }),
    ).toThrow("bridge_schema_mismatch");
  });

  it("rejects malformed static intel", () => {
    expect(() =>
      parseCompanionBridgeState({
        ...validState,
        currentSystemStaticIntel: { siteCount: "9" },
      }),
    ).toThrow("bridge_static_intel_invalid");
  });
});
