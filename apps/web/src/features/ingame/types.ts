/**
 * Generic UI state types for in-game panels.
 * Keeps features/ingame/ free of frontier/dappKit imports.
 */

export type CharacterResolutionUiState =
  | { status: 'not_applicable' }
  | { status: 'available'; label?: string }
  | { status: 'unavailable'; reason: string };
