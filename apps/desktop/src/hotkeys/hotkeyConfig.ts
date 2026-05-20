export const defaultCompanionToggleHotkey = "Ctrl+Shift+Space";

export function resolveCompanionToggleHotkey(configuredHotkey?: string): string {
  const trimmed = configuredHotkey?.trim();
  return trimmed || defaultCompanionToggleHotkey;
}

export const companionToggleHotkey = resolveCompanionToggleHotkey(
  import.meta.env.VITE_SIGNAL_VAULT_COMPANION_HOTKEY,
);

export const companionToggleAction = {
  id: "toggle_overlay",
  label: "Toggle overlay",
  target: "overlay_visibility",
} as const;
