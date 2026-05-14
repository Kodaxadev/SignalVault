export type TrayStatus =
  | { state: "available" }
  | { state: "failed" }
  | { state: "unavailable" };

export function formatTrayStatus(status: TrayStatus): string {
  if (status.state === "available") {
    return "Tray: available";
  }

  if (status.state === "failed") {
    return "Tray unavailable - use hotkey/window controls.";
  }

  return "Tray unavailable outside desktop shell.";
}
