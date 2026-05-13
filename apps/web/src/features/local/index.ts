// local — Dexie schema, local persistence, import/export helpers
export { db } from './localDb';
export { getLocalDbStatus, setLocalDbStatus, subscribeLocalDbStatus, type LocalDbStatusType } from './localDbStatus';
export { loadAllSignals, addSignal, addSignalsBatch, clearSignals } from './localSignalRepository';
export { loadAllClassifications, addClassification, addClassificationsBatch, clearClassifications } from './localEntityClassificationRepository';
export { exportLocalData, type LocalExportEnvelopeV1 } from './localExport';
export { importLocalData, type LocalImportResult } from './localImport';
export { LocalPersistenceBadge } from './components/LocalPersistenceBadge';
export { LocalExportPanel } from './components/LocalExportPanel';
export { LocalImportPanel } from './components/LocalImportPanel';
export { LocalDbErrorBanner } from './components/LocalDbErrorBanner';
