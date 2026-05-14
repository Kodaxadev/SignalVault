import { useGameTypeQuery } from '../types/useGameTypeQuery';
import type { TypeContext } from '../types/gameTypeExtractors';
import { TerminalPanel } from '@/features/ingame/TerminalFrame';

export function WorldApiTypePanel({ typeId }: { typeId?: string }) {
  const typeQuery = useGameTypeQuery(typeId);

  if (typeQuery.status === 'pending' || !typeId) {
    return (
      <TerminalPanel title="Official Type Data" code="WORLD API" headingLevel={3}>
        <p className="font-mono text-xs uppercase text-zinc-500">Loading...</p>
      </TerminalPanel>
    );
  }

  if (typeQuery.isError || !typeQuery.data) {
    return (
      <TerminalPanel title="Official Type Data" code="WORLD API" tone="warning" headingLevel={3}>
        <p className="font-mono text-xs uppercase text-zinc-500">World API data unavailable.</p>
      </TerminalPanel>
    );
  }

  const typeData: TypeContext = typeQuery.data;

  return (
    <TerminalPanel title="Official Type Data" code="WORLD API" headingLevel={3}>
      <dl className="grid gap-1 font-mono text-xs uppercase text-zinc-500 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="contents">
          <dt>Name</dt>
          <dd className="text-zinc-200">{typeData.name}</dd>
        </div>
        {typeData.groupName && (
          <div className="contents">
            <dt>Group</dt>
            <dd className="text-zinc-300">{typeData.groupName}</dd>
          </div>
        )}
        {typeData.categoryName && (
          <div className="contents">
            <dt>Category</dt>
            <dd className="text-zinc-300">{typeData.categoryName}</dd>
          </div>
        )}
        {typeData.description && (
          <div className="contents">
            <dt>Description</dt>
            <dd className="text-zinc-300 normal-case">{typeData.description}</dd>
          </div>
        )}
      </dl>
    </TerminalPanel>
  );
}
