import { useState } from 'react';
import { exportLocalData } from '@/features/local/localExport';
import { db } from '@/features/local/localDb';

export function LocalExportPanel() {
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setStatus('exporting');
    try {
      const data = await exportLocalData(db);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `signal-vault-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('success');
      setMessage('Export successful!');
    } catch (e) {
      setStatus('error');
      setMessage(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold text-white mb-2">Export Local Data</h3>
      <button
        onClick={handleExport}
        disabled={status === 'exporting'}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 disabled:opacity-50"
      >
        {status === 'exporting' ? 'Exporting...' : 'Export Local Data'}
      </button>
      {message && (
        <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
      )}
    </div>
  );
}
