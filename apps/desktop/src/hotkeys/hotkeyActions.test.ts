import { describe, expect, it } from "vitest";
import { getOverlayToggleTarget } from "./hotkeyActions";

describe("getOverlayToggleTarget", () => {
  it("hides the overlay when it is visible", () => {
    expect(getOverlayToggleTarget("visible")).toBe("hide");
  });

  it("shows the overlay when it is hidden", () => {
    expect(getOverlayToggleTarget("hidden")).toBe("show");
  });
});
