import { useViewerSession } from '@/features/viewer';
import { checkTribeVaultReadiness } from '../tribeVaultReadiness';
import { TribeVaultUnavailable } from './TribeVaultUnavailable';
import { TribeScopeLockedBadge } from './TribeScopeLockedBadge';

export function TribeVaultReadinessPanel() {
  const { viewer } = useViewerSession();
  const readiness = checkTribeVaultReadiness(viewer);

  if (!readiness.ready) {
    return <TribeVaultUnavailable reason={readiness.missingPieces[0] ?? 'Unknown reason'} />;
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-xs font-semibold text-gray-400">TRIBE VAULT STATUS</h3>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-gray-500">Tribe:</dt>
          <dd className="text-gray-200">{readiness.identity.tribeName}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-gray-500">Available scopes:</dt>
          <dd className="text-gray-300">{readiness.availableScopes.join(', ') || 'none'}</dd>
        </div>
        {readiness.lockedScopes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {readiness.lockedScopes.map((l) => (
              <TribeScopeLockedBadge key={l.scope} scope={l.scope} reason={l.reason} />
            ))}
          </div>
        )}
      </dl>
      {readiness.warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-yellow-300">
          {readiness.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
