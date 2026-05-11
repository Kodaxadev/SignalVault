import { useGameTypeQuery } from '../types/useGameTypeQuery';
import type { TypeContext } from '../types/gameTypeExtractors';

export function WorldApiTypePanel({ typeId }: { typeId?: string }) {
  const typeQuery = useGameTypeQuery(typeId);

  if (typeQuery.status === 'pending' || !typeId) {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TYPE DATA</h3>
        <p className="mt-1 text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  if (typeQuery.isError || !typeQuery.data) {
    return (
      <div className="rounded border border-gray-700 bg-gray-900 p-3">
        <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TYPE DATA</h3>
        <p className="mt-1 text-xs text-gray-500">World API data unavailable.</p>
      </div>
    );
  }

  const typeData: TypeContext = typeQuery.data;

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">OFFICIAL TYPE DATA</h3>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-gray-500">Name:</dt>
          <dd className="text-gray-200">{typeData.name}</dd>
        </div>
        {typeData.groupName && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Group:</dt>
            <dd className="text-gray-300">{typeData.groupName}</dd>
          </div>
        )}
        {typeData.categoryName && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Category:</dt>
            <dd className="text-gray-300">{typeData.categoryName}</dd>
          </div>
        )}
        {typeData.description && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Description:</dt>
            <dd className="text-gray-300">{typeData.description}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
