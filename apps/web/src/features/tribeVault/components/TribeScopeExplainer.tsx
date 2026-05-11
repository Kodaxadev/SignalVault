import type { TribeScopeLevel } from '../tribeScopeTypes';
import { resolveTribeIdentity } from '../tribePolicy';
import type { ViewerContext } from '@/features/viewer';

const scopeDescriptions: Record<TribeScopeLevel, (tribeName?: string) => string> = {
  tribe: (name) => `Visible to all members of ${name ?? 'your tribe'}.`,
  officer: () => 'Visible to officers only. Requires officer role.',
  scout_cell: () => 'Visible to your scout cell.',
};

export function TribeScopeExplainer({ viewer }: { viewer: ViewerContext }) {
  const identity = resolveTribeIdentity(viewer);
  if (!identity) return null;

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">SCOPE EXPLANATIONS</h3>
      <dl className="mt-2 space-y-2 text-xs">
        <div>
          <dt className="text-purple-300 font-medium">Tribe</dt>
          <dd className="text-gray-400">{scopeDescriptions.tribe(identity.tribeName)}</dd>
        </div>
        <div>
          <dt className="text-amber-300 font-medium">Officer</dt>
          <dd className="text-gray-400">{scopeDescriptions.officer()}</dd>
        </div>
        <div>
          <dt className="text-cyan-300 font-medium">Scout Cell</dt>
          <dd className="text-gray-400">{scopeDescriptions.scout_cell()} <span className="text-yellow-400">(Locked: cell identity missing)</span></dd>
        </div>
      </dl>
    </div>
  );
}
