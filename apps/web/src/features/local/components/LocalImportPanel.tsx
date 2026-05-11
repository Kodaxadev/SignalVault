import { useState } from 'react';
import { importLocalData, type LocalImportResult } from '@/features/local/localImport';
import { db } from '@/features/local/localDb';

export function LocalImportPanel() {
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [result, setResult] = useState<LocalImportResult | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Early file type check
    if (!file.name.toLowerCase().endsWith('.json')) {
      setResult({
        mode,
        totalSignals: 0,
        totalClassifications: 0,
        importedSignals: 0,
        importedClassifications: 0,
        skippedSignals: 0,
        skippedClassifications: 0,
        errors: ['Invalid file type. Please select a .json backup file.'],
      });
      return;
    }

    if (mode === 'replace' && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }

    const text = await file.text();
    const importResult = await importLocalData(db, text, mode);
    setResult(importResult);
    setConfirmReplace(false);
  };

  const handleCancelConfirm = () => setConfirmReplace(false);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold text-white mb-2">Import Local Data</h3>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-gray-300">Mode:</label>
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value as 'merge' | 'replace'); setConfirmReplace(false); }}
          className="bg-gray-700 text-white text-xs rounded px-2 py-1"
        >
          <option value="merge">Merge</option>
          <option value="replace">Replace</option>
        </select>
      </div>
      {confirmReplace && (
        <div className="mb-3 p-2 bg-red-900/40 border border-red-700 rounded">
          <p className="text-xs text-red-300">This will delete all existing data. Are you sure?</p>
          <div className="flex gap-2 mt-1">
            <button onClick={handleCancelConfirm} className="px-2 py-1 text-xs bg-gray-600 text-white rounded">Cancel</button>
            <label className="px-2 py-1 text-xs bg-red-600 text-white rounded cursor-pointer">
              Confirm & Import
              <input type="file" accept=".json" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>
      )}
      {!confirmReplace && (
        <input type="file" accept=".json" onChange={handleFile} className="text-xs text-gray-300" />
      )}
      {result && (
        <div className="mt-3 text-xs">
          {result.errors.length > 0 ? (
            <div>
              {result.importedSignals === 0 && result.importedClassifications === 0 ? (
                <p className="text-red-400 font-medium mb-1">Import rejected — no valid records found.</p>
              ) : null}
              <ul className="text-red-400 list-disc pl-4">
                {result.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          ) : (
            <p className="text-green-400">
              {result.importedSignals} signals, {result.importedClassifications} classifications imported.
              {result.skippedSignals > 0 && ` ${result.skippedSignals} signals skipped.`}
              {result.skippedClassifications > 0 && ` ${result.skippedClassifications} classifications skipped.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
