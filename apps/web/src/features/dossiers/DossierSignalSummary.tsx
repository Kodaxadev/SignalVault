import type { Signal } from '@/features/signals/signalTypes';
import { getLatestSignal, countSignalsByType } from '@/features/dossiers/dossierSignals';
import { getStalenessSummary } from '@/features/staleness/staleSignalQueries';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const typeLabels: Record<Signal['signalType'], string> = {
  field_note: 'Field',
  gate_recon: 'Gate',
  storage_manifest: 'Storage',
  route_report: 'Route',
  market_report: 'Market',
  system_report: 'System',
  assembly_log: 'Assembly',
  hostile_contact: 'Hostile',
  permit_report: 'Permit',
  access_denied: 'Denied',
  resource_report: 'Resource',
  after_action_report: 'After Action',
};

export function DossierSignalSummary({ signals }: { signals: Signal[] }) {
  const latest = getLatestSignal(signals);
  const counts = countSignalsByType(signals);
  const staleness = getStalenessSummary(signals);
  const staleCount = staleness.stale + staleness.critical;
  const topTypes = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="rounded border border-gray-800 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">
          {signals.length} signal{signals.length !== 1 ? 's' : ''}
          {staleCount > 0 && <span className="ml-1 text-orange-400">· {staleCount} stale</span>}
        </span>
        {latest && <span className="text-gray-500">Last: {timeAgo(latest.createdAt)}</span>}
      </div>
      {topTypes.length > 0 && (
        <div className="mt-1 flex gap-2 text-gray-500">
          {topTypes.map(([type, count]) => (
            <span key={type}>{typeLabels[type as Signal['signalType']]}: {count}</span>
          ))}
        </div>
      )}
    </div>
  );
}
