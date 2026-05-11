import { useCurrentSystem } from '../CurrentSystemProvider';

export function CurrentSystemBadge() {
  const { currentSystem, clearCurrentSystem } = useCurrentSystem();

  if (!currentSystem) {
    return <span className="text-xs text-gray-600">◈ no system set</span>;
  }

  return (
    <span className="flex items-center gap-1 text-xs">
      <span className="text-cyan-500">◈</span>
      <span className="text-gray-200 font-mono">{currentSystem.systemName}</span>
      {currentSystem.source === 'manual' && (
        <span className="text-gray-600">(manual)</span>
      )}
      <button
        onClick={clearCurrentSystem}
        className="text-gray-600 hover:text-gray-300 ml-1 leading-none"
        aria-label="Clear current system"
      >
        ✕
      </button>
    </span>
  );
}
