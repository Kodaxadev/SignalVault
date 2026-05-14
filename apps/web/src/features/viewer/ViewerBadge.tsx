import type { ViewerContext } from './viewerTypes';

const stateLabels: Record<ViewerContext['state'], string> = {
  anonymous: 'IDENTITY UNRESOLVED',
  wallet_connected: 'WALLET CONNECTED',
  character_resolved: 'CHARACTER RESOLVED',
};

const stateColors: Record<ViewerContext['state'], string> = {
  anonymous: 'text-yellow-400',
  wallet_connected: 'text-blue-400',
  character_resolved: 'text-green-400',
};

export function ViewerBadge({ viewer }: { viewer: ViewerContext }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-zinc-800 bg-black/70 px-3 py-2 font-mono text-xs uppercase">
      <span className={`font-semibold ${stateColors[viewer.state]}`}>
        {stateLabels[viewer.state]}
      </span>
      {viewer.characterName && (
        <span className="text-zinc-300">{viewer.characterName}</span>
      )}
      {viewer.tribeName && (
        <span className="text-zinc-500">| {viewer.tribeName}</span>
      )}
      {viewer.state === 'anonymous' && (
        <span className="text-zinc-500">Public dossier only. Local drafts enabled.</span>
      )}
    </div>
  );
}
