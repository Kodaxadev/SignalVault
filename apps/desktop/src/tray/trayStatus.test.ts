import { describe, expect, it } from "vitest";
import { formatTrayStatus } from "./trayStatus";

describe("formatTrayStatus", () => {
  it("shows available tray state", () => {
    expect(formatTrayStatus({ state: "available" })).toBe("Tray: available");
  });

  it("shows failure fallback copy", () => {
    expect(formatTrayStatus({ state: "failed" })).toBe(
      "Tray unavailable - use hotkey/window controls.",
    );
  });

  it("shows unavailable copy outside the desktop shell", () => {
    expect(formatTrayStatus({ state: "unavailable" })).toBe(
      "Tray unavailable outside desktop shell.",
    );
  });
});
