import type { RouteWarning, RouteWarningLevel } from '../routeWarningTypes';

function levelLabel(level: RouteWarningLevel): string {
  switch (level) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'CAUTION';
    case 'info': return 'INFO';
  }
}

function levelColor(level: RouteWarningLevel): string {
  switch (level) {
    case 'critical': return 'border-red-700 bg-red-950/40 text-red-400';
    case 'high': return 'border-orange-700 bg-orange-950/40 text-orange-400';
    case 'medium': return 'border-yellow-700 bg-yellow-950/40 text-yellow-400';
    case 'info': return 'border-gray-700 bg-gray-900 text-gray-400';
  }
}

function signalTypeLabel(signalType: string): string {
  return signalType.replace(/_/g, ' ').toUpperCase();
}

function formatAge(isoTimestamp: string): string {
  const ageMs = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RouteWarningCard({ warning }: { warning: RouteWarning }) {
  const colors = levelColor(warning.level);
  const systemDisplay = warning.systemName ?? warning.systemId;

  return (
    <div className={`rounded border px-3 py-2 space-y-0.5 ${colors}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide">{levelLabel(warning.level)}</span>
        {warning.isStale && (
          <span className="text-xs text-gray-500 font-mono">STALE</span>
        )}
      </div>
      <div className="text-xs text-gray-300 font-mono">{systemDisplay}</div>
      <div className="text-xs text-gray-400">
        {signalTypeLabel(warning.signalType)}
        {warning.signalCount > 1 && (
          <span className="text-gray-500 ml-1">× {warning.signalCount}</span>
        )}
        <span className="text-gray-600 ml-2">{formatAge(warning.latestSignalAt)}</span>
      </div>
    </div>
  );
}
