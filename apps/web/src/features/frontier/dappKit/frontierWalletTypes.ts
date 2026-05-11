export type FrontierWalletSnapshot =
  | {
      status: 'unavailable';
      reason: 'provider_missing' | 'not_connected' | 'connection_error' | 'unknown';
      error?: string;
    }
  | {
      status: 'connected';
      walletAddress: string;
      source: 'eve_vault' | 'sui_wallet' | 'unknown_wallet';
      raw?: unknown;
    };
