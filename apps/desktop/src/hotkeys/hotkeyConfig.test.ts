import { describe, expect, it } from "vitest";
import {
  companionToggleAction,
  companionToggleHotkey,
  defaultCompanionToggleHotkey,
  resolveCompanionToggleHotkey,
} from "./hotkeyConfig";

describe("companionToggleHotkey", () => {
  it("uses the default low-conflict accelerator", () => {
    expect(companionToggleHotkey).toBe("Ctrl+Shift+Space");
    expect(defaultCompanionToggleHotkey).toBe("Ctrl+Shift+Space");
  });

  it("allows a configured accelerator for packaged overlays", () => {
    expect(resolveCompanionToggleHotkey("F9")).toBe("F9");
  });

  it("falls back to the default when no accelerator is configured", () => {
    expect(resolveCompanionToggleHotkey("   ")).toBe("Ctrl+Shift+Space");
  });

  it("targets overlay visibility only", () => {
    expect(companionToggleAction).toEqual({
      id: "toggle_overlay",
      label: "Toggle overlay",
      target: "overlay_visibility",
    });
  });
});
