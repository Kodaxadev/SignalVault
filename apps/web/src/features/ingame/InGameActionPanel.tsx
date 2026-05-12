import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { CharacterResolutionUiState } from './types';
import { TerminalButton, TerminalStatusStrip } from './TerminalFrame';

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
        <TerminalStatusStrip tone="success">
          Signal logged locally: {lastSignalMessage}
        </TerminalStatusStrip>
      )}

      {viewer.state === 'anonymous' && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-zinc-400">
            Object context is visible. Connect identity to attribute field intel and unlock private
            operator scope.
          </p>
          <TerminalButton tone="primary" onClick={onConnectIdentity}>
            Connect Identity
          </TerminalButton>
        </div>
      )}

      {viewer.state === 'wallet_connected' && characterResolution.status === 'available' && (
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase text-sky-300">
            Character data available for resolution.
          </p>
          <p className="text-xs text-zinc-500">
            Resolve the current Frontier character before writing character-attributed Signals.
          </p>
          <TerminalButton tone="success" onClick={onResolveCharacter}>
            Resolve Character
          </TerminalButton>
        </div>
      )}

      {viewer.state === 'wallet_connected' && characterResolution.status === 'unavailable' && (
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase text-zinc-300">Wallet connected.</p>
          <p className="text-xs text-zinc-500">
            Character data unavailable: {characterResolution.reason}.
          </p>
        </div>
      )}

      {viewer.state === 'wallet_connected' && characterResolution.status === 'not_applicable' && (
        <p className="font-mono text-xs uppercase text-zinc-300">Wallet connected.</p>
      )}

      {viewer.state === 'character_resolved' && (
        <TerminalStatusStrip tone="success">
          Character resolved. All Signal features available.
        </TerminalStatusStrip>
      )}
    </div>
  );
}
