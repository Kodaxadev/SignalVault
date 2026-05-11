/**
 * Player-facing empty state components. Pure presentational — no state, no hooks.
 */

export function NoObjectContext() {
  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-4 text-center">
      <h2 className="text-sm font-semibold text-gray-200">NO OBJECT DETECTED</h2>
      <p className="mt-2 text-xs text-gray-400">
        Open Signal Vault from a Smart Assembly in EVE Frontier to see full dossier intel.
      </p>
    </div>
  );
}

export function ObjectUnresolved() {
  return (
    <div className="rounded border border-yellow-800 bg-yellow-900/20 p-3">
      <p className="text-xs text-yellow-300">
        We have context for this object, but not a verified type yet.
      </p>
    </div>
  );
}

export function ManualClassificationNote() {
  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <p className="text-xs text-gray-400">
        MANUAL CLASSIFICATION — Useful for now, not yet verified by EVE data.
      </p>
    </div>
  );
}
