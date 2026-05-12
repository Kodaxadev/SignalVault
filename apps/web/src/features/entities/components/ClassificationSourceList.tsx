import type { EntityClassificationClaim, EntityResolutionSource } from '@/features/entities/entityClassificationTypes';

const sourceLabels: Record<EntityResolutionSource, string> = {
  url_hint: 'URL Context',
  user_manual: 'User Manual',
  mock_registry: 'Mock Registry',
  tribe_registry: 'Tribe Registry',
  maintainer_registry: 'Maintainer Registry',
  owner_claim_verified: 'Owner Verified',
  dappkit_current_object: 'dApp Kit',
  world_api: 'World API',
  indexed: 'Indexed',
  onchain_verified: 'On-Chain Verified',
  unknown: 'Unknown',
};

const typeLabels = {
  smart_gate: 'Smart Gate',
  smart_storage_unit: 'Smart Storage Unit',
  smart_turret: 'Smart Turret',
  network_node: 'Network Node',
  character: 'Character',
  tribe: 'Tribe',
  system: 'System',
  route: 'Route',
  market: 'Market',
  item: 'Item',
  unknown: 'Unknown',
};

export function ClassificationSourceList({
  claims,
}: {
  claims: EntityClassificationClaim[];
}) {
  if (claims.length === 0) return null;

  return (
    <div className="rounded border border-gray-800 p-3">
      <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources</h4>
      <ul className="space-y-1 text-xs text-gray-500">
        {claims.map((claim) => (
          <li key={claim.id} className="flex justify-between">
            <span>{sourceLabels[claim.source]}</span>
            <span className="text-gray-300">{typeLabels[claim.claimedType]}</span>
            {claim.priority > 0 && (
              <span className="text-gray-600">[{claim.priority}]</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
