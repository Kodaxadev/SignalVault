import { getOverlayToggleTarget } from "./hotkeys/hotkeyActions";

declare global {
  interface Window {
    readonly __TAURI_INTERNALS__?: unknown;
  }
}

export async function hideCompanionWindow(): Promise<void> {
  if (!window.__TAURI_INTERNALS__) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().hide();
}

export async function toggleCompanionWindow(): Promise<void> {
  if (!window.__TAURI_INTERNALS__) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const companionWindow = getCurrentWindow();
  const isVisible = await companionWindow.isVisible();
  const target = getOverlayToggleTarget(isVisible ? "visible" : "hidden");

  if (target === "hide") {
    await companionWindow.hide();
    return;
  }

  await companionWindow.show();
  await companionWindow.setFocus();
}
