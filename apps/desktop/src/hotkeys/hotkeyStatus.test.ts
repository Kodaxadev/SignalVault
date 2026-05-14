import { describe, expect, it } from "vitest";
import { formatHotkeyStatus } from "./hotkeyStatus";

describe("formatHotkeyStatus", () => {
  it("shows the registered accelerator", () => {
    expect(
      formatHotkeyStatus({
        state: "registered",
        accelerator: "Ctrl+Shift+Space",
      }),
    ).toBe("Hotkey: Ctrl+Shift+Space");
  });

  it("shows fallback copy when registration fails", () => {
    expect(
      formatHotkeyStatus({
        state: "failed",
        accelerator: "Ctrl+Shift+Space",
      }),
    ).toBe("Hotkey unavailable - use tray/window controls.");
  });

  it("shows unavailable copy outside the desktop shell", () => {
    expect(
      formatHotkeyStatus({
        state: "unavailable",
        accelerator: "Ctrl+Shift+Space",
      }),
    ).toBe("Hotkey unavailable outside desktop shell.");
  });
});
