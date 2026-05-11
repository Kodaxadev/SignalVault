export function TribeScopeLockedBadge({ scope, reason }: { scope: string; reason: string }) {
  return (
    <span className="inline-flex items-center rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500" title={reason}>
      {scope} locked
    </span>
  );
}
