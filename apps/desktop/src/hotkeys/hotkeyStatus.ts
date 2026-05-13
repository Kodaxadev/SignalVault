export type HotkeyStatus =
  | { state: "registered"; accelerator: string }
  | { state: "failed"; accelerator: string }
  | { state: "unavailable"; accelerator: string };

export function formatHotkeyStatus(status: HotkeyStatus): string {
  if (status.state === "registered") {
    return `Hotkey: ${status.accelerator}`;
  }

  if (status.state === "failed") {
    return "Hotkey unavailable - use tray/window controls.";
  }

  return "Hotkey unavailable outside desktop shell.";
}
