export const trayMenuItems = [
  { id: "show_overlay", label: "Show Overlay", enabled: true },
  { id: "hide_overlay", label: "Hide Overlay", enabled: true },
  { id: "toggle_overlay", label: "Toggle Overlay", enabled: true },
  { id: "open_vault", label: "Open Vault", enabled: true },
  { id: "quit", label: "Quit", enabled: true },
] as const;

export type TrayMenuItemId = (typeof trayMenuItems)[number]["id"];
