import type { PolicyContext, PolicyResult } from './policyTypes';

// All tribe-scoped visibilities require verified tribe identity and character.
// public/private require wallet only (already ensured by verifyAuth passing).
const TRIBE_SCOPES = new Set<string>(['tribe', 'officer', 'scout_cell']);

export function checkPolicy(ctx: PolicyContext): PolicyResult {
  const { characterId, tribeId, requestedVisibility } = ctx;

  if (TRIBE_SCOPES.has(requestedVisibility)) {
    if (!tribeId) {
      return { allowed: false, reason: 'tribe_identity_missing' };
    }
    if (!characterId) {
      return { allowed: false, reason: 'character_required' };
    }
  }

  return { allowed: true };
}
