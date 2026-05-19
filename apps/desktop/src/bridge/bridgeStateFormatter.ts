import type {
  CompanionBridgeSignal,
  CompanionBridgeState,
  CompanionBridgeWarning,
} from "./bridgeTypes";

export function formatBridgeSystemName(state: CompanionBridgeState): string {
  return state.currentSystem?.name ?? "Unknown";
}

export function formatBridgeStaticIntel(state: CompanionBridgeState): string {
  const intel = state.currentSystemStaticIntel;
  if (!intel) return "No static site intel";

  return `${intel.siteCount} sites / ${intel.beltGroups} belts / ${intel.trojanGroups} trojans`;
}

export function formatBridgeStaticDanger(state: CompanionBridgeState): string {
  const intel = state.currentSystemStaticIntel;
  if (!intel) return "Static context unavailable";

  return `${intel.dangerTaggedGroups} danger groups`;
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
