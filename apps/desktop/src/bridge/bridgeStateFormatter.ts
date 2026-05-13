import type {
  CompanionBridgeSignal,
  CompanionBridgeState,
  CompanionBridgeWarning,
} from "./bridgeTypes";

export function formatBridgeSystemName(state: CompanionBridgeState): string {
  return state.currentSystem?.name ?? "Unknown";
}

export function formatBridgeWarnings(
  state: CompanionBridgeState,
  limit = 3,
): readonly CompanionBridgeWarning[] {
  return state.warnings.slice(0, limit);
}

export function formatBridgeSignals(
  state: CompanionBridgeState,
  limit = 3,
): readonly CompanionBridgeSignal[] {
  return state.latestSignals.slice(0, limit);
}
