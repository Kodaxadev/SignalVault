import { useState, useCallback } from 'react';
import { db } from '@/features/local/localDb';

interface CompatReport {
  userAgent: string;
  viewport: { width: number; height: number; dpr: number };
  features: {
    fetch: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDb: boolean;
    cookies: boolean;
    cssGrid: boolean;
    cssFlex: boolean;
  };
  signalVault: {
    indexedDbTest: 'pass' | 'fail';
    dexieTest: 'pass' | 'fail';
    storageEstimate: string;
  };
  timestamp: string;
}

function checkFeature(name: string): boolean {
  try {
    switch (name) {
      case 'fetch':
        return typeof fetch === 'function';
      case 'localStorage':
        return typeof localStorage === 'object';
      case 'sessionStorage':
        return typeof sessionStorage === 'object';
      case 'indexedDb':
        return typeof indexedDB === 'object';
      case 'cookies':
        return typeof navigator === 'object' && navigator.cookieEnabled !== false;
      case 'cssGrid':
        return typeof CSS !== 'undefined' && CSS.supports('display', 'grid');
      case 'cssFlex':
        return typeof CSS !== 'undefined' && CSS.supports('display', 'flex');
      default:
        return false;
    }
  } catch {
    return false;
  }
}

async function testIndexedDb(): Promise<'pass' | 'fail'> {
  try {
    const req = indexedDB.open('sv-compat-test');
    return await new Promise((resolve) => {
      req.onsuccess = () => {
        const testDb = req.result;
        const tx = testDb.transaction('test', 'readwrite');
        tx.objectStore('test').put({ id: 1, ok: true });
        tx.oncomplete = () => {
          testDb.close();
          indexedDB.deleteDatabase('sv-compat-test');
          resolve('pass');
        };
        tx.onerror = () => resolve('fail');
      };
      req.onerror = () => resolve('fail');
      req.onupgradeneeded = () => {
        req.result.createObjectStore('test', { keyPath: 'id' });
      };
    });
  } catch {
    return 'fail';
  }
}

async function testDexie(): Promise<'pass' | 'fail'> {
  try {
    await db.table('signals').count();
    return 'pass';
  } catch {
    return 'fail';
  }
}

async function getStorageEst(): Promise<string> {
  if (!navigator.storage?.estimate) return 'estimate unavailable';
  try {
    const est = await navigator.storage.estimate();
    if (est.usage == null) return 'estimate unavailable';
    const usageMb = (est.usage / (1024 * 1024)).toFixed(1);
    const totalMb = est.quota ? (est.quota / (1024 * 1024)).toFixed(0) : '?';
    return `${usageMb} MB used / ${totalMb} MB available`;
  } catch {
    return 'estimate unavailable';
  }
}

async function buildReport(): Promise<CompatReport> {
  const [indexedDbTest, dexieTest, storageEstimate] = await Promise.all([
    testIndexedDb(),
    testDexie(),
    getStorageEst(),
  ]);

  return {
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio ?? 1,
    },
    features: {
      fetch: checkFeature('fetch'),
      localStorage: checkFeature('localStorage'),
      sessionStorage: checkFeature('sessionStorage'),
      indexedDb: checkFeature('indexedDb'),
      cookies: checkFeature('cookies'),
      cssGrid: checkFeature('cssGrid'),
      cssFlex: checkFeature('cssFlex'),
    },
    signalVault: { indexedDbTest, dexieTest, storageEstimate },
    timestamp: new Date().toISOString(),
  };
}

const statusIcon = (ok: boolean | string) => (ok === true || ok === 'pass' ? '\u2705' : '\u274C');

export function CompatPage() {
  const [report, setReport] = useState<CompatReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>('');

  const runDiagnostics = useCallback(async () => {
    setLoading(true);
    const r = await buildReport();
    setReport(r);
    setLoading(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!report) return;

    const clipboard = navigator.clipboard;
    if (!clipboard?.writeText) {
      setCopyStatus('Copy unavailable in this browser');
      return;
    }

    try {
      const text = JSON.stringify(report, null, 2);
      await clipboard.writeText(text);
      setCopyStatus('Copied to clipboard!');
    } catch {
      setCopyStatus('Copy failed — try selecting text manually');
    }
  }, [report]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      <h1 className="text-lg font-bold mb-4">Browser Compatibility Diagnostics</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
        {report && (
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
          >
            Copy Report
          </button>
        )}
      </div>
      {copyStatus && <p className="text-xs text-gray-400 mb-2">{copyStatus}</p>}

      {report && (
        <>
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">User Agent</h2>
            <p className="text-xs text-gray-400 font-mono break-all">{report.userAgent}</p>
          </section>

          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Viewport</h2>
            <dl className="text-xs text-gray-400 space-y-1">
              <dt>Width: <span className="text-gray-200">{report.viewport.width}px</span></dt>
              <dt>Height: <span className="text-gray-200">{report.viewport.height}px</span></dt>
              <dt>Device Pixel Ratio: <span className="text-gray-200">{report.viewport.dpr}</span></dt>
            </dl>
          </section>

          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Features</h2>
            <ul className="text-xs space-y-1">
              {Object.entries(report.features).map(([key, value]) => (
                <li key={key}>
                  {statusIcon(value)} {key}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Signal Vault Checks</h2>
            <ul className="text-xs space-y-1">
              <li>{statusIcon(report.signalVault.indexedDbTest)} IndexedDB accessible</li>
              <li>{statusIcon(report.signalVault.dexieTest)} Dexie initialized</li>
              <li>Browser storage estimate: <span className="text-gray-200">{report.signalVault.storageEstimate}</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Timestamp</h2>
            <p className="text-xs text-gray-500">{report.timestamp}</p>
          </section>
        </>
      )}

      {!report && !loading && (
        <p className="text-sm text-gray-500">Click "Run Diagnostics" to check browser compatibility.</p>
      )}
    </div>
  );
}
