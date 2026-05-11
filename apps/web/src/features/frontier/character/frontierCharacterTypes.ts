export type FrontierCharacterSnapshot =
  | {
      status: 'unavailable';
      reason:
        | 'wallet_not_connected'
        | 'profile_not_found'
        | 'character_not_found'
        | 'resolver_unavailable'
        | 'provider_missing'
        | 'unknown';
      error?: string;
    }
  | {
      status: 'resolved';
      source: 'wallet_profile' | 'assembly_owner_candidate' | 'mock';
      walletAddress: string;
      characterId: string;
      characterObjectId?: string;
      characterName?: string;
      tribeId?: string;
      tribeName?: string;
      raw?: unknown;
    };
