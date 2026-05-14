import type { TrayStatus } from "./trayStatus";

declare global {
  interface Window {
    readonly __TAURI_INTERNALS__?: unknown;
  }
}

export type TrayStatusListener = (status: TrayStatus) => void;

export function registerTrayStatus(onStatus: TrayStatusListener): void {
  onStatus({
    state: window.__TAURI_INTERNALS__ ? "available" : "unavailable",
  });
}
