import type { ViewerContext } from '@/features/viewer/viewerTypes';

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
  anonymous: 'border-yellow-800 bg-yellow-900/20',
  wallet_connected: 'border-blue-800 bg-blue-900/20',
  character_resolved: 'border-emerald-800 bg-emerald-900/20',
};

const labelColors: Record<ViewerContext['state'], string> = {
  anonymous: 'text-yellow-300',
  wallet_connected: 'text-blue-300',
  character_resolved: 'text-emerald-300',
};

export function InGameModeBanner({ viewer }: { viewer: ViewerContext }) {
  return (
    <div className={`rounded border px-3 py-2 ${stateColors[viewer.state]}`}>
      <p className={`text-xs font-semibold ${labelColors[viewer.state]}`}>
        {stateLabels[viewer.state]}
      </p>
      <p className="mt-0.5 text-xs text-gray-300">{stateSubtext[viewer.state]}</p>
    </div>
  );
}
