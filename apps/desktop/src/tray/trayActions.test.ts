import { describe, expect, it } from "vitest";
import { getTrayActionTarget } from "./trayActions";

describe("getTrayActionTarget", () => {
  it("targets overlay menu actions at the window", () => {
    expect(getTrayActionTarget("show_overlay")).toBe("window");
    expect(getTrayActionTarget("hide_overlay")).toBe("window");
    expect(getTrayActionTarget("toggle_overlay")).toBe("window");
  });

  it("targets quit at the app", () => {
    expect(getTrayActionTarget("quit")).toBe("app");
  });

  it("keeps Open Vault disabled", () => {
    expect(getTrayActionTarget("open_vault")).toBe("disabled");
  });
});
