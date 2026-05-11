export type WalletSigningSnapshot =
  | {
      status: 'available';
      walletAddress: string;
      signMessage: (message: string) => Promise<string>;
    }
  | {
      status: 'unavailable';
      reason:
        | 'provider_missing'
        | 'wallet_not_connected'
        | 'signing_not_supported'
        | 'unknown';
      error?: string;
    };
