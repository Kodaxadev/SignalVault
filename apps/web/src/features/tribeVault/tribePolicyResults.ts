export type TribePolicyDenialReason =
  | 'not_character_resolved'
  | 'tribe_missing'
  | 'tribe_mismatch'
  | 'officer_role_missing'
  | 'scout_role_missing'
  | 'cell_identity_missing';

export type TribePolicyResult =
  | { allowed: true }
  | { allowed: false; reason: TribePolicyDenialReason };
