import type { SystemContext } from '../solarSystems/solarSystemExtractors';

export function WorldApiTopologyPanel({ systems }: { systems: SystemContext[] }) {
  if (systems.length === 0) {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TOPOLOGY</h3>
        <p className="mt-1 text-xs text-gray-500">No gate links found.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TOPOLOGY</h3>
      <div className="mt-2 space-y-1 text-xs">
        {systems.slice(0, 5).map((system) => (
          <div key={system.id} className="flex items-center gap-2 text-gray-300 font-mono">
            <span>{system.name}</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-500">{system.connectedSystemIds.length} gate{system.connectedSystemIds.length !== 1 ? 's' : ''}</span>
          </div>
        ))}
        {systems.length > 5 && (
          <p className="text-gray-500">+{systems.length - 5} more</p>
        )}
      </div>
    </div>
  );
}
