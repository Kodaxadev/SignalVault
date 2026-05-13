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
