import { describe, expect, it } from "vitest";
import {
  maxCurrentSystemInputLength,
  parseCurrentSystemDraft,
} from "./currentSystemDraft";

describe("parseCurrentSystemDraft", () => {
  it("trims current system input", () => {
    expect(parseCurrentSystemDraft({ systemInput: "  OQQ-0R8  " })).toEqual({
      systemInput: "OQQ-0R8",
    });
  });

  it("rejects empty and oversized current system input", () => {
    expect(parseCurrentSystemDraft({ systemInput: "   " })).toEqual({
      status: "invalid",
      reason: "empty",
    });
    expect(
      parseCurrentSystemDraft({
        systemInput: "x".repeat(maxCurrentSystemInputLength + 1),
      }),
    ).toEqual({
      status: "invalid",
      reason: "too_long",
    });
  });
});
