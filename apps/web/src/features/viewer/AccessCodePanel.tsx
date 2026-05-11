import { useState } from 'react';
import { useViewerSession } from '@/features/viewer';

export function AccessCodePanel({ onBack }: { onBack?: () => void }) {
  const { actions } = useViewerSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter an access code.');
      return;
    }

    const result = actions.consumeAccessCode(trimmed);
    if (result.success) {
      setSuccess(true);
      setCode('');
    } else if (result.error) {
      setError(result.error.message);
    }
  };

  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3">
      <h3 className="text-sm font-semibold text-gray-200 mb-2">Enter Access Code</h3>
      {success && (
        <div className="mb-2 rounded bg-green-900/50 border border-green-700 px-3 py-2 text-xs text-green-300">
          Identity connected. Session linked.
        </div>
      )}
      {error && (
        <div className="mb-2 rounded bg-red-900/50 border border-red-700 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SCOUT-001"
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:outline-none"
          data-testid="access-code-input"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600"
          >
            Connect
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800"
            >
              Back
            </button>
          )}
        </div>
      </form>
      <details className="mt-3 text-xs text-gray-500">
        <summary className="cursor-pointer">Development codes</summary>
        <ul className="mt-1 space-y-1 font-mono">
          <li>SCOUT-001 — Scout role</li>
          <li>OFFICER-001 — Officer + tribe</li>
          <li>PILOT-001 — Tribe member, no special role</li>
          <li>USED-001 — Expired/consumed code</li>
        </ul>
      </details>
    </div>
  );
}
