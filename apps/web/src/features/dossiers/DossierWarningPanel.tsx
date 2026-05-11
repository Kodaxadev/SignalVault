export function DossierWarningPanel({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded border border-yellow-800 bg-yellow-900/20 p-3">
      <ul className="space-y-1 text-xs text-yellow-300">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
