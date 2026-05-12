import type { ViewerContext } from '@/features/viewer/viewerTypes';
import { TerminalStatusStrip } from './TerminalFrame';

const stateLabels: Record<ViewerContext['state'], string> = {
  anonymous: 'IDENTITY UNRESOLVED',
  wallet_connected: 'WALLET CONNECTED',
  character_resolved: 'CHARACTER RESOLVED',
};

const stateSubtext: Record<ViewerContext['state'], string> = {
  anonymous: 'Public dossier only. Local Signals are saved on this device.',
  wallet_connected: 'Private local Signals enabled. Resolve character to unlock character-attributed intel.',
  character_resolved: 'Signals are now attributed to your Frontier character.',
};

const stateColors: Record<ViewerContext['state'], string> = {
  anonymous: 'warning',
  wallet_connected: 'info',
  character_resolved: 'success',
};

const labelColors: Record<ViewerContext['state'], string> = {
  anonymous: 'text-black',
  wallet_connected: 'text-sky-300',
  character_resolved: 'text-emerald-300',
};

export function InGameModeBanner({ viewer }: { viewer: ViewerContext }) {
  return (
    <TerminalStatusStrip tone={stateColors[viewer.state] as 'warning' | 'info' | 'success'}>
      <span className={labelColors[viewer.state]}>{stateLabels[viewer.state]}</span>
      <span className={viewer.state === 'anonymous' ? 'ml-3 text-black/80' : 'ml-3 text-zinc-300'}>
        {stateSubtext[viewer.state]}
      </span>
    </TerminalStatusStrip>
  );
}
