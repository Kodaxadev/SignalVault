export type ViewerState = 'anonymous' | 'wallet_connected' | 'character_resolved';

export type ReadScope = 'public' | 'private' | 'tribe';

export interface ViewerContext {
  state: ViewerState;
  walletAddress?: string;
  characterId?: string;
  characterObjectId?: string;
  characterName?: string;
  tribeId?: string;
  tribeName?: string;
  roles: string[];
  tenant?: string;
  canWriteShared?: boolean;
  canReadScopes?: readonly ReadScope[];
}

export function anonymousViewer(tenant?: string): ViewerContext {
  return {
    state: 'anonymous',
    roles: [],
    tenant,
  };
}
