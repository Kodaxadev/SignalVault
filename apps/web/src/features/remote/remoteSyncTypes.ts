import type { SignalVisibility } from '@/features/signals/signalTypes';

export type SyncDirection = 'push' | 'pull';
export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'success' | 'failed';

export interface SyncEvent {
  signalId: string;
  direction: SyncDirection;
  status: SyncStatus;
  error?: string;
  timestamp: string;
}

export interface PromotionRule {
  fromVisibility: SignalVisibility;
  promotableDirectly: boolean;
  requiresVisibilityChange: boolean;
  requiresPolicyCheck: boolean;
}

export const PROMOTION_RULES: Record<SignalVisibility, PromotionRule> = {
  local_private: {
    fromVisibility: 'local_private',
    promotableDirectly: false,
    requiresVisibilityChange: true,
    requiresPolicyCheck: true,
  },
  private: {
    fromVisibility: 'private',
    promotableDirectly: true,
    requiresVisibilityChange: false,
    requiresPolicyCheck: false,
  },
  tribe: {
    fromVisibility: 'tribe',
    promotableDirectly: true,
    requiresVisibilityChange: false,
    requiresPolicyCheck: true,
  },
  officer: {
    fromVisibility: 'officer',
    promotableDirectly: true,
    requiresVisibilityChange: false,
    requiresPolicyCheck: true,
  },
  scout_cell: {
    fromVisibility: 'scout_cell',
    promotableDirectly: true,
    requiresVisibilityChange: false,
    requiresPolicyCheck: true,
  },
  public: {
    fromVisibility: 'public',
    promotableDirectly: true,
    requiresVisibilityChange: false,
    requiresPolicyCheck: false,
  },
};
