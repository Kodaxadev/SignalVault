import type { TrayMenuItemId } from "./trayConfig";

export type TrayActionTarget = "window" | "app" | "disabled";

export function getTrayActionTarget(id: TrayMenuItemId): TrayActionTarget {
  if (id === "quit") {
    return "app";
  }

  if (id === "open_vault") {
    return "disabled";
  }

  return "window";
}
