import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { CharacterResolutionUiState } from './types';

interface InGameActionPanelProps {
  viewer: ViewerContext;
  characterResolution: CharacterResolutionUiState;
  lastSignalMessage?: string;
  onConnectIdentity: () => void;
  onResolveCharacter: () => void;
}

export function InGameActionPanel({
  viewer,
  characterResolution,
  lastSignalMessage,
  onConnectIdentity,
  onResolveCharacter,
}: InGameActionPanelProps) {
  return (
    <div className="space-y-3">
      {lastSignalMessage && (
        <div className="rounded border border-emerald-800 bg-emerald-900/20 px-3 py-2">
          <p className="text-xs text-emerald-300">Signal logged locally: {lastSignalMessage}</p>
        </div>
      )}

      {viewer.state === 'anonymous' && (
        <div className="rounded border border-yellow-800 bg-yellow-900/20 p-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onConnectIdentity}
              className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600"
            >
              Connect Identity
            </button>
          </div>
        </div>
      )}

      {viewer.state === 'wallet_connected' && characterResolution.status === 'available' && (
        <div className="rounded border border-blue-800 bg-blue-900/20 p-3">
          <p className="text-xs text-blue-300">Character data available for resolution.</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onResolveCharacter}
              className="rounded bg-emerald-700 px-3 py-1.5 text-xs text-white hover:bg-emerald-600"
            >
              Resolve Character
            </button>
          </div>
        </div>
      )}

      {viewer.state === 'wallet_connected' && characterResolution.status === 'unavailable' && (
        <div className="rounded border border-gray-700 bg-gray-900 p-3">
          <p className="text-xs text-gray-300">Wallet connected.</p>
          <p className="mt-1 text-xs text-gray-400">
            Character data unavailable: {characterResolution.reason}.
          </p>
        </div>
      )}

      {viewer.state === 'wallet_connected' && characterResolution.status === 'not_applicable' && (
        <div className="rounded border border-gray-700 bg-gray-900 p-3">
          <p className="text-xs text-gray-300">Wallet connected.</p>
        </div>
      )}

      {viewer.state === 'character_resolved' && (
        <div className="rounded border border-emerald-800 bg-emerald-900/20 p-3">
          <p className="text-xs text-emerald-300">Character resolved. All Signal features available.</p>
        </div>
      )}
    </div>
  );
}
