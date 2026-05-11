import { LocalExportPanel, LocalImportPanel, LocalPersistenceBadge, LocalDbErrorBanner } from '@/features/local';
import { CurrentSystemBadge, CurrentSystemSelector } from '@/features/worldContext';

export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg font-semibold">Signal Vault — External</h1>
        <LocalPersistenceBadge />
        <CurrentSystemBadge />
      </header>
      <main className="p-4 space-y-4">
        <LocalDbErrorBanner />
        <p className="text-sm text-gray-400">
          External app mode — full editor, search, entity registry, and admin coming in later phases.
        </p>
        <div className="space-y-4 max-w-md">
          <CurrentSystemSelector />
          <LocalExportPanel />
          <LocalImportPanel />
        </div>
      </main>
    </div>
  );
}
