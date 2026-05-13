import { toggleCompanionWindow } from "../companionWindow";
import { companionToggleHotkey } from "./hotkeyConfig";
import type { HotkeyStatus } from "./hotkeyStatus";

declare global {
  interface Window {
    readonly __TAURI_INTERNALS__?: unknown;
  }
}

export type HotkeyStatusListener = (status: HotkeyStatus) => void;

export async function registerCompanionHotkey(
  onStatus: HotkeyStatusListener,
): Promise<void> {
  if (!window.__TAURI_INTERNALS__) {
    onStatus({
      state: "unavailable",
      accelerator: companionToggleHotkey,
    });
    return;
  }

  try {
    const { isRegistered, register } = await import(
      "@tauri-apps/plugin-global-shortcut"
    );
    const alreadyRegistered = await isRegistered(companionToggleHotkey);

    if (!alreadyRegistered) {
      await register(companionToggleHotkey, (event) => {
        if ("state" in event && event.state !== "Pressed") {
          return;
        }

        void toggleCompanionWindow();
      });
    }

    onStatus({
      state: "registered",
      accelerator: companionToggleHotkey,
    });
  } catch {
    onStatus({
      state: "failed",
      accelerator: companionToggleHotkey,
    });
  }
}
