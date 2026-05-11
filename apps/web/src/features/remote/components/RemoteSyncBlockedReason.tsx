export type BlockedSyncReason =
  | 'no_backend_url'
  | 'no_auth_method'
  | 'signing_not_supported'
  | 'wallet_not_connected'
  | 'provider_missing'
  | 'character_token_blocked';

const COPY: Record<BlockedSyncReason, string> = {
  no_backend_url:
    'Remote push not configured. Set VITE_REMOTE_SYNC_URL to enable.',
  no_auth_method:
    'No auth method available. Enable dev auth or connect a wallet.',
  signing_not_supported:
    'Wallet signing not available here. Open in the EVE Frontier in-game browser to push Signals.',
  wallet_not_connected:
    'No wallet connected. Connect your wallet to push Signals remotely.',
  provider_missing:
    'EVE Frontier client not detected. Open in the in-game browser to push Signals.',
  character_token_blocked:
    'Character token not available (alpha limitation). Set VITE_REMOTE_DEV_CHARACTER_JWT to continue.',
};

interface Props {
  reason: BlockedSyncReason;
}

export function RemoteSyncBlockedReason({ reason }: Props) {
  return (
    <span className="text-gray-500 text-xs max-w-[180px] text-right leading-tight">
      {COPY[reason]}
    </span>
  );
}
