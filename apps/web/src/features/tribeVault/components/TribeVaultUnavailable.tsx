export function TribeVaultUnavailable({ reason }: { reason: string }) {
  return (
    <div className="rounded border border-yellow-800 bg-yellow-900/20 p-3">
      <h3 className="text-xs font-semibold text-yellow-400">TRIBE VAULT UNAVAILABLE</h3>
      <p className="mt-1 text-xs text-yellow-300">{reason}</p>
    </div>
  );
}
