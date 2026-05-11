import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppShell } from './AppShell';
import { CompatPage } from './CompatPage';

const InGameRoute = lazy(() => import('./InGameRoute'));

function NotFound() {
  return (
    <div className="p-4 text-center text-gray-400">
      <h1 className="text-2xl font-bold">404</h1>
      <p>Route not found.</p>
    </div>
  );
}

function SuspenseFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/app/*" element={<AppShell />} />
      <Route path="/ingame/object" element={<Suspense fallback={<SuspenseFallback />}><InGameRoute /></Suspense>} />
      <Route path="/ingame/object/:objectId" element={<Suspense fallback={<SuspenseFallback />}><InGameRoute /></Suspense>} />
      <Route path="/compat" element={<CompatPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
