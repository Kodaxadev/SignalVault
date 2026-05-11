export type WorldApiStatusBadgeStatus = 'pending' | 'success' | 'cache' | 'stale' | 'unavailable';

export function WorldApiStatusBadge({ status }: { status: WorldApiStatusBadgeStatus }) {
  const colors: Record<WorldApiStatusBadgeStatus, string> = {
    pending: 'bg-yellow-400',
    success: 'bg-green-400',
    cache: 'bg-cyan-400',
    stale: 'bg-orange-400',
    unavailable: 'bg-gray-500',
  };

  const labels: Record<WorldApiStatusBadgeStatus, string> = {
    pending: 'Loading official data...',
    success: 'Official World API data loaded',
    cache: 'Using cached World API data',
    stale: 'Using stale cached data (World API unavailable)',
    unavailable: 'World API unavailable',
  };

  return (
    <span className="inline-flex items-center gap-1" title={labels[status]}>
      <span className={`h-2 w-2 rounded-full ${colors[status]}`} />
      <span className="text-xs text-gray-500">{status}</span>
    </span>
  );
}
