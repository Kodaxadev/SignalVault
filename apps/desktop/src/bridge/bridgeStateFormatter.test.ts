import { describe, expect, it } from "vitest";
import {
  formatBridgeSignals,
  formatBridgeStaticDanger,
  formatBridgeStaticIntel,
  formatBridgeSystemName,
  formatBridgeWarnings,
} from "./bridgeStateFormatter";

const state = {
  app: "signal-vault",
  schemaVersion: 1,
  generatedAt: "2026-05-12T00:00:00Z",
  currentSystem: { name: "OQQ-0R8", source: "manual" },
  currentSystemStaticIntel: {
    siteCount: 9,
    beltGroups: 3,
    trojanGroups: 2,
    dangerTaggedGroups: 5,
    tags: ["non_zero_danger_level"],
  },
  warnings: [
    { id: "1", level: "warning", title: "One", detail: "A" },
    { id: "2", level: "info", title: "Two", detail: "B" },
    { id: "3", level: "critical", title: "Three", detail: "C" },
    { id: "4", level: "warning", title: "Four", detail: "D" },
  ],
  latestSignals: [
    {
      id: "1",
      title: "One",
      type: "hostile_contact",
      confidence: "observed",
      visibility: "tribe",
      createdAt: "2026-05-12T00:00:00Z",
    },
    {
      id: "2",
      title: "Two",
      type: "route_report",
      confidence: "verified",
      visibility: "public",
      createdAt: "2026-05-11T00:00:00Z",
    },
    {
      id: "3",
      title: "Three",
      type: "field_note",
      confidence: "rumor",
      visibility: "private",
      createdAt: "2026-05-10T00:00:00Z",
    },
  ],
} as const;

describe("bridgeStateFormatter", () => {
  it("formats the current system name", () => {
    expect(formatBridgeSystemName(state)).toBe("OQQ-0R8");
  });

  it("returns a safe unknown system when absent", () => {
    expect(formatBridgeSystemName({ ...state, currentSystem: undefined })).toBe(
      "Unknown",
    );
  });

  it("caps warnings for compact overlay display", () => {
    expect(formatBridgeWarnings(state, 2)).toHaveLength(2);
  });

  it("returns a safe empty warning state", () => {
    expect(formatBridgeWarnings({ ...state, warnings: [] })).toEqual([]);
  });

  it("caps latest signals for compact overlay display", () => {
    expect(formatBridgeSignals(state, 2)).toHaveLength(2);
  });

  it("formats compact static site context", () => {
    expect(formatBridgeStaticIntel(state)).toBe("9 sites / 3 belts / 2 trojans");
    expect(formatBridgeStaticDanger(state)).toBe("5 danger groups");
  });

  it("returns safe static context copy when absent", () => {
    expect(formatBridgeStaticIntel({ ...state, currentSystemStaticIntel: undefined })).toBe(
      "No static site intel",
    );
  });
});
