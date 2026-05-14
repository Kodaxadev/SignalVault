import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import { TerminalPanel, TerminalStatusStrip } from '@/features/ingame/TerminalFrame';

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
    <TerminalPanel title="Classification Conflict" code="RECHECK" tone="danger" headingLevel={3}>
      <TerminalStatusStrip tone="danger">
        Sources disagree about this object. Recheck before relying on this dossier.
      </TerminalStatusStrip>
      <ul className="mt-2 space-y-1 font-mono text-xs uppercase text-zinc-400">
        {uniqueTypes.map((t) => (
          <li key={t}>{typeLabels[t]}</li>
        ))}
      </ul>
    </TerminalPanel>
  );
}
