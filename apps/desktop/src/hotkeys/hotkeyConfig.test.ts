import { describe, expect, it } from "vitest";
import { companionToggleAction, companionToggleHotkey } from "./hotkeyConfig";

describe("companionToggleHotkey", () => {
  it("uses the default low-conflict accelerator", () => {
    expect(companionToggleHotkey).toBe("Ctrl+Shift+Space");
  });

  it("targets overlay visibility only", () => {
    expect(companionToggleAction).toEqual({
      id: "toggle_overlay",
      label: "Toggle overlay",
      target: "overlay_visibility",
    });
  });
});
