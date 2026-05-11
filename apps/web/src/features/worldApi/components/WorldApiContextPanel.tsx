import type { SystemContext } from '../solarSystems/solarSystemExtractors';

export function WorldApiContextPanel({
  system,
  status,
}: {
  system?: SystemContext | null;
  status: 'pending' | 'success' | 'error';
}) {
  if (status === 'pending') {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL SYSTEM CONTEXT</h3>
        <p className="mt-1 text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  if (status === 'error' || !system) {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL SYSTEM CONTEXT</h3>
        <p className="mt-1 text-xs text-gray-500">World API data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">OFFICIAL SYSTEM CONTEXT</h3>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-gray-500">System:</dt>
          <dd className="text-gray-200">{system.name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-gray-500">Constellation:</dt>
          <dd className="text-gray-300 font-mono">{system.constellationId}</dd>
        </div>
        {system.connectedSystemIds.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Gate links:</dt>
            <dd className="text-gray-300 font-mono">{system.connectedSystemIds.length} linked</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
