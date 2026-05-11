import { useTribeQuery } from '../tribes/useTribeQuery';
import type { TribeContext } from '../tribes/tribeExtractors';

export function WorldApiTribePanel({ tribeId }: { tribeId?: string }) {
  const tribeQuery = useTribeQuery(tribeId);

  if (tribeQuery.status === 'pending' || !tribeId) {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TRIBE DATA</h3>
        <p className="mt-1 text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  if (tribeQuery.isError || !tribeQuery.data) {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TRIBE DATA</h3>
        <p className="mt-1 text-xs text-gray-500">World API data unavailable.</p>
      </div>
    );
  }

  const tribe: TribeContext = tribeQuery.data;

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TRIBE DATA</h3>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-gray-500">Name:</dt>
          <dd className="text-gray-200">{tribe.name}</dd>
        </div>
        {tribe.nameShort && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Short:</dt>
            <dd className="text-gray-300">{tribe.nameShort}</dd>
          </div>
        )}
        {tribe.description && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Description:</dt>
            <dd className="text-gray-300">{tribe.description}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
