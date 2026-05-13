import type { TrayMenuItemId } from "./trayConfig";

export type TrayActionTarget = "window" | "app" | "external_url";

export function getTrayActionTarget(id: TrayMenuItemId): TrayActionTarget {
  if (id === "quit") {
    return "app";
  }

  if (id === "open_vault") {
    return "external_url";
  }

  return "window";
}
