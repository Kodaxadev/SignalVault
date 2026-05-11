import { useState } from 'react';
import { fetchSolarSystem } from '@/features/worldApi';
import { useCurrentSystem } from '../CurrentSystemProvider';

export function CurrentSystemSelector() {
  const { currentSystem, setCurrentSystem, clearCurrentSystem } = useCurrentSystem();
  const [inputValue, setInputValue] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'manual' | 'error'; message: string } | null>(null);

  const handleSet = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setIsLooking(true);
    setFeedback(null);

    // Numeric input — try World API lookup first
    if (/^\d+$/.test(trimmed)) {
      try {
        const result = await fetchSolarSystem(trimmed);
        if (result.status === 'loaded') {
          setCurrentSystem({
            systemId: result.data.id,
            systemName: result.data.name,
            source: 'world_api',
            setAt: new Date().toISOString(),
          });
          setInputValue('');
          setFeedback({ kind: 'ok', message: `Set to ${result.data.name}` });
          setIsLooking(false);
          return;
        }
      } catch {
        // Fall through to manual
      }
    }

    // Text input or World API unavailable — store as manual
    setCurrentSystem({
      systemId: trimmed,
      systemName: trimmed,
      source: 'manual',
      setAt: new Date().toISOString(),
    });
    setInputValue('');
    setFeedback({ kind: 'manual', message: 'Set manually — not World API verified' });
    setIsLooking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void handleSet();
  };

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3 space-y-2">
      <h3 className="text-xs font-semibold text-gray-400">CURRENT SYSTEM</h3>

      {currentSystem ? (
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <span className="text-cyan-500">◈ </span>
            <span className="text-gray-200 font-mono">{currentSystem.systemName}</span>
            {currentSystem.source === 'manual' && (
              <span className="text-gray-500 ml-1">(manual)</span>
            )}
          </div>
          <button
            onClick={clearCurrentSystem}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500">No current system set.</p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setFeedback(null); }}
          onKeyDown={handleKeyDown}
          placeholder="System ID or name"
          className="flex-1 text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-700"
          disabled={isLooking}
        />
        <button
          onClick={() => void handleSet()}
          disabled={isLooking || !inputValue.trim()}
          className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 rounded text-gray-200"
        >
          {isLooking ? '…' : 'Set'}
        </button>
      </div>

      {feedback && (
        <p className={`text-xs ${feedback.kind === 'ok' ? 'text-cyan-500' : feedback.kind === 'manual' ? 'text-yellow-600' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}

      <p className="text-xs text-gray-600">
        Enter a numeric system ID for World API verification, or any name to set manually.
      </p>
    </div>
  );
}
