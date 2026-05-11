import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';

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

export function ClassificationConflictBanner({
  conflictingClaims,
}: {
  conflictingClaims: EntityClassificationClaim[];
}) {
  if (conflictingClaims.length === 0) return null;

  const types = [...new Set(conflictingClaims.map((c) => c.claimedType))];
  const allTypes = [
    ...(conflictingClaims[0] ? [conflictingClaims[0].claimedType] : []),
    ...types,
  ];
  const uniqueTypes = [...new Set(allTypes)];

  return (
    <div className="rounded border border-red-800 bg-red-900/30 p-3">
      <h4 className="text-sm font-semibold text-red-300 mb-1">Classification Conflict</h4>
      <p className="text-xs text-red-400 mb-2">
        Sources disagree about this object. Recheck before relying on this dossier.
      </p>
      <ul className="text-xs text-gray-400 space-y-1">
        {uniqueTypes.map((t) => (
          <li key={t}>{typeLabels[t]}</li>
        ))}
      </ul>
    </div>
  );
}
