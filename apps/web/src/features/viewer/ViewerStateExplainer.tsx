const stateExplainers = {
  anonymous: {
    label: 'Anonymous',
    can: ['View public dossiers', 'Create local-only drafts'],
    cannot: ['Publish remote Signals', 'Create tribe/shared Signals'],
  },
  wallet_connected: {
    label: 'Wallet Connected',
    can: ['Create private remote Signals', 'Create public Signals', 'Generate access codes'],
    cannot: ['Create tribe/officer/scout-cell Signals until character resolves'],
  },
  character_resolved: {
    label: 'Character Resolved',
    can: ['Character-attributed Signals', 'Tribe Signals (if tribe membership resolved)', 'Role-scoped Signals (if role data exists)'],
    cannot: [],
  },
};

export function ViewerStateExplainer({ state }: { state: string }) {
  const explainer = stateExplainers[state as keyof typeof stateExplainers];
  if (!explainer) return null;

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3 text-xs">
      <h3 className="font-semibold text-gray-200 mb-2">{explainer.label} — What you can do</h3>
      <ul className="space-y-1">
        {explainer.can.map((item) => (
          <li key={item} className="text-green-400">✅ {item}</li>
        ))}
        {explainer.cannot.map((item) => (
          <li key={item} className="text-red-400">❌ {item}</li>
        ))}
      </ul>
    </div>
  );
}
