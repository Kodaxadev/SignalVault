import { useState } from 'react';
import { useViewerSession } from '@/features/viewer';
import type { FrontierWalletSnapshot } from '@/features/frontier/dappKit/frontierWalletTypes';

export function ConnectIdentityPanel({
  onDone,
  walletSnapshot,
  onConnectWallet,
}: {
  onDone?: () => void;
  walletSnapshot?: FrontierWalletSnapshot;
  onConnectWallet?: () => void;
}) {
  const { actions } = useViewerSession();
  const [mode, setMode] = useState<'choice' | 'access-code' | 'wallet'>('choice');

  const isWalletConnected = walletSnapshot?.status === 'connected';
  const canConnect = walletSnapshot?.status === 'unavailable' && walletSnapshot.reason === 'not_connected';
  const providerMissing = walletSnapshot?.status === 'unavailable' && walletSnapshot.reason === 'provider_missing';

  const handleWalletConnect = () => {
    if (onConnectWallet && canConnect) {
      onConnectWallet();
    } else if (!walletSnapshot) {
      // Non-ingame route: use mock
      actions.connectWallet();
    }
    setMode('choice');
    onDone?.();
  };

  if (isWalletConnected) {
    return (
      <div className="rounded border border-green-800 bg-green-900/20 p-3">
        <p className="text-xs text-green-300">
          Wallet connected: {walletSnapshot.walletAddress.slice(0, 10)}…
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Private local Signals enabled. Resolve character to unlock character-attributed intel.
        </p>
      </div>
    );
  }

  if (mode === 'access-code') {
    return (
      <AccessCodeSubPanel
        onBack={() => setMode('choice')}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-sm font-semibold text-gray-200 mb-2">Connect Identity</h3>
      <p className="text-xs text-gray-400 mb-3">
        Opening Signal Vault from EVE Frontier proves object context, not identity.
        Connect your wallet or enter an access code to publish Signals.
      </p>
      <div className="space-y-2">
        {providerMissing ? (
          <p className="text-xs text-yellow-300">
            Wallet connection unavailable in this context. Use access code flow.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleWalletConnect}
            className="w-full rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-600"
          >
            Connect EVE Vault
          </button>
        )}
        <button
          type="button"
          onClick={() => setMode('access-code')}
          className="w-full rounded border border-gray-700 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800"
        >
          Enter In-Game Access Code
        </button>
      </div>
    </div>
  );
}

function AccessCodeSubPanel({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone?: () => void;
}) {
  const { actions } = useViewerSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter an access code.');
      return;
    }

    const result = actions.consumeAccessCode(trimmed);
    if (result.success) {
      setCode('');
      onDone?.();
    } else if (result.error) {
      setError(result.error.message);
    }
  };

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-sm font-semibold text-gray-200 mb-2">Enter Access Code</h3>
      {error && (
        <div className="mb-2 rounded bg-red-900/50 border border-red-700 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SCOUT-001"
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:outline-none"
          data-testid="access-code-input"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600">
            Connect
          </button>
          <button type="button" onClick={onBack} className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800">
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
