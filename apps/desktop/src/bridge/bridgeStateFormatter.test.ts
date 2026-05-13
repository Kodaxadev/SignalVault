import { describe, expect, it } from "vitest";
import {
  formatBridgeSignals,
  formatBridgeSystemName,
  formatBridgeWarnings,
} from "./bridgeStateFormatter";

const state = {
  app: "signal-vault",
  schemaVersion: 1,
  generatedAt: "2026-05-12T00:00:00Z",
  currentSystem: { name: "OQQ-0R8", source: "manual" },
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
});
