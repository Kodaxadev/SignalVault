export type RemoteSignalVisibility =
  | 'tribe'
  | 'officer'
  | 'scout_cell'
  | 'public'
  | 'private';

export type PolicyOperation = 'create' | 'update' | 'delete' | 'read' | 'export';

export type PolicyDenialReason =
  | 'tribe_identity_missing'
  | 'tribe_mismatch'
  | 'scope_not_allowed'
  | 'visibility_not_allowed'
  | 'character_required';

export interface PolicyContext {
  walletAddress: string;
  characterId?: string;
  tribeId?: string;
  requestedVisibility: RemoteSignalVisibility;
  operation: PolicyOperation;
}

export type PolicyResult =
  | { allowed: true }
  | { allowed: false; reason: PolicyDenialReason };
