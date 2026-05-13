import { describe, expect, it } from "vitest";
import {
  maxQuickNoteLength,
  parseQuickNoteDraft,
} from "./quickNoteDraft";

describe("parseQuickNoteDraft", () => {
  it("trims body text and keeps current system context", () => {
    expect(
      parseQuickNoteDraft({
        body: "  Hostile contact at node  ",
        currentSystemName: "OQQ-0R8",
      }),
    ).toEqual({
      body: "Hostile contact at node",
      currentSystemName: "OQQ-0R8",
    });
  });

  it("rejects empty and oversized note bodies", () => {
    expect(parseQuickNoteDraft({ body: "   " })).toEqual({
      status: "invalid",
      reason: "empty",
    });
    expect(parseQuickNoteDraft({ body: "x".repeat(maxQuickNoteLength + 1) })).toEqual({
      status: "invalid",
      reason: "too_long",
    });
  });
});
