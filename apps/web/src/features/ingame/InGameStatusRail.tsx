import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { ResolvedEntity } from '@/features/entities';
import type { LocalDbStatusType } from '@/features/local/localDbStatus';

const dbStatusColors: Record<LocalDbStatusType, string> = {
  checking: 'bg-gray-400',
  ready: 'bg-green-500',
  degraded: 'bg-amber-500',
  unavailable: 'bg-red-500',
};

const dbStatusLabels: Record<LocalDbStatusType, string> = {
  checking: 'DB checking…',
  ready: 'Local DB ready',
  degraded: 'DB degraded',
  unavailable: 'DB unavailable',
};

const entityConfidenceColors: Record<ResolvedEntity['confidence'], string> = {
  unknown: 'text-gray-400',
  url_hint: 'text-yellow-400',
  manual: 'text-amber-400',
  cached: 'text-blue-400',
  indexed: 'text-cyan-400',
  onchain_verified: 'text-emerald-400',
  conflicted: 'text-red-400',
};

const typeLabels: Record<ResolvedEntity['type'], string> = {
  smart_gate: 'Gate',
  smart_storage_unit: 'Storage',
  smart_turret: 'Turret',
  network_node: 'Node',
  character: 'Character',
  tribe: 'Tribe',
  system: 'System',
  route: 'Route',
  market: 'Market',
  item: 'Item',
  unknown: 'Unknown',
};

function identityLabel(viewer: ViewerContext): string {
  switch (viewer.state) {
    case 'anonymous': return 'Anonymous';
    case 'wallet_connected': return 'Wallet connected';
    case 'character_resolved': return viewer.characterName ?? 'Character resolved';
  }
}

function identityDotColor(viewer: ViewerContext): string {
  switch (viewer.state) {
    case 'anonymous': return 'bg-yellow-400';
    case 'wallet_connected': return 'bg-blue-400';
    case 'character_resolved': return 'bg-emerald-400';
  }
}

export function InGameStatusRail({
  viewer,
  entity,
  localStatus,
}: {
  viewer: ViewerContext;
  entity: ResolvedEntity;
  localStatus: LocalDbStatusType;
}) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full ${identityDotColor(viewer)}`} />
        <span className="text-gray-300">{identityLabel(viewer)}</span>
      </span>
      <span className="text-gray-600">|</span>
      <span className={entityConfidenceColors[entity.confidence]}>
        {typeLabels[entity.type]} · {entity.confidence}
      </span>
      <span className="text-gray-600">|</span>
      <span className="flex items-center gap-1 text-gray-300">
        <span className={`h-1.5 w-1.5 rounded-full ${dbStatusColors[localStatus]}`} />
        {dbStatusLabels[localStatus]}
      </span>
    </div>
  );
}
