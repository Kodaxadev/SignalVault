import { describe, expect, it } from "vitest";
import { trayMenuItems } from "./trayConfig";

describe("trayMenuItems", () => {
  it("keeps stable action ids", () => {
    expect(trayMenuItems.map((item) => item.id)).toEqual([
      "show_overlay",
      "hide_overlay",
      "toggle_overlay",
      "open_vault",
      "quit",
    ]);
  });

  it("keeps Open Vault disabled until the external-open slice", () => {
    expect(
      trayMenuItems.find((item) => item.id === "open_vault"),
    ).toMatchObject({
      label: "Open Vault",
      enabled: false,
    });
  });
});
