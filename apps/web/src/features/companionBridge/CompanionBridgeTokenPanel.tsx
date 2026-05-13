import { useState } from 'react';
import {
  companionBridgeTokenStorageKey,
  loadCompanionBridgeToken,
  saveCompanionBridgeToken,
} from './companionBridgeToken';

export function CompanionBridgeTokenPanel() {
  const [token, setToken] = useState(() => loadCompanionBridgeToken() ?? '');
  const [status, setStatus] = useState(token ? 'configured' : 'unpaired');

  return (
    <section className="border border-gray-800 bg-gray-900/60 p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-200">
          Companion Bridge
        </h2>
        <span className="text-xs uppercase text-gray-400">{status}</span>
      </div>
      <label className="block text-xs uppercase text-gray-400" htmlFor="bridge-token">
        Bridge token
      </label>
      <input
        id="bridge-token"
        className="w-full bg-black border border-gray-700 px-2 py-2 font-mono text-xs text-gray-100"
        value={token}
        autoComplete="off"
        data-storage-key={companionBridgeTokenStorageKey}
        onChange={(event) => setToken(event.target.value)}
      />
      <button
        type="button"
        className="border border-orange-700 bg-orange-700 px-3 py-2 text-xs font-bold uppercase text-black"
        onClick={() => {
          saveCompanionBridgeToken(token);
          setStatus('saved');
        }}
      >
        Save Bridge Token
      </button>
    </section>
  );
}
