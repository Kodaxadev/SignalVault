import type { StalenessSummary } from '@/features/staleness/staleSignalQueries';
import type { Contradiction } from '@/features/contradictions/contradictionTypes';

interface DossierIntelHealthPanelProps {
  stalenessSummary: StalenessSummary;
  contradictions: Contradiction[];
  warnings: string[];
}

const severityColors: Record<Contradiction['severity'], string> = {
  critical: 'bg-red-900 text-red-300',
  warning: 'bg-yellow-900 text-yellow-300',
};

export function DossierIntelHealthPanel({
  stalenessSummary,
  contradictions,
  warnings,
}: DossierIntelHealthPanelProps) {
  const hasCriticalStaleness = stalenessSummary.critical > 0;
  const hasCriticalContradictions = contradictions.some((c) => c.severity === 'critical');
  const showRescout = hasCriticalStaleness || hasCriticalContradictions;

  return (
    <div className="space-y-3 rounded border border-gray-800 bg-gray-900 p-3 text-xs">
      <h3 className="font-semibold text-gray-200">Intel Health</h3>

      {/* Staleness summary */}
      <div className="space-y-1">
        <div className="text-gray-400">
          {stalenessSummary.fresh} fresh, {stalenessSummary.aging} aging, {stalenessSummary.stale} stale
          {stalenessSummary.critical > 0 ? `, ${stalenessSummary.critical} critical` : ''}
        </div>
      </div>

      {/* Contradiction warnings */}
      {contradictions.length > 0 && (
        <div className="space-y-1">
          <div className="font-medium text-gray-300">Contradictions ({contradictions.length})</div>
          <div className="space-y-1">
            {contradictions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${severityColors[c.severity]}`}>
                  {c.severity}
                </span>
                <span className="text-gray-400">{c.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          <div className="font-medium text-gray-300">Warnings</div>
          <ul className="list-inside list-disc space-y-0.5 text-orange-400">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Re-scout recommendation */}
      {showRescout && (
        <div className="rounded bg-red-950 px-2 py-1.5 text-sm text-red-300">
          Re-scout recommended — intel reliability compromised.
        </div>
      )}
    </div>
  );
}
