import type { Dexie } from 'dexie';
import type { Signal } from '@/features/signals/signalTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import type { LocalExportEnvelopeV1 } from './localExport';
import { addSignalsBatch, clearSignals } from './localSignalRepository';
import { addClassificationsBatch, clearClassifications } from './localEntityClassificationRepository';

export type LocalImportResult = {
  mode: 'merge' | 'replace';
  totalSignals: number;
  totalClassifications: number;
  importedSignals: number;
  importedClassifications: number;
  skippedSignals: number;
  skippedClassifications: number;
  errors: string[];
};

function validateSignal(s: unknown): s is Signal {
  if (!s || typeof s !== 'object') return false;
  const o = s as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string' &&
    Array.isArray(o.linkedEntities) &&
    typeof o.signalType === 'string' &&
    typeof o.confidence === 'string' &&
    typeof o.author === 'object' &&
    o.author !== null &&
    typeof o.visibility === 'string' &&
    typeof o.syncState === 'string'
  );
}

function validateClaim(c: unknown): c is EntityClassificationClaim {
  if (!c || typeof c !== 'object') return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.entityKey === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.source === 'string' &&
    typeof o.claimedType === 'string'
  );
}

export async function importLocalData(
  db: Dexie,
  jsonData: string,
  mode: 'merge' | 'replace' = 'merge',
): Promise<LocalImportResult> {
  const errors: string[] = [];
  let envelope: LocalExportEnvelopeV1;

  try {
    envelope = JSON.parse(jsonData) as LocalExportEnvelopeV1;
  } catch {
    return { mode, totalSignals: 0, totalClassifications: 0, importedSignals: 0, importedClassifications: 0, skippedSignals: 0, skippedClassifications: 0, errors: ['Invalid JSON'] };
  }

  if (envelope.schemaVersion !== 1) {
    errors.push(`Unsupported schema version: ${envelope.schemaVersion}. Expected 1.`);
  }
  if (envelope.app !== 'signal-vault') {
    errors.push(`Unknown app: ${envelope.app}. Expected "signal-vault".`);
  }
  if (!Array.isArray(envelope.signals)) {
    errors.push('Missing or invalid "signals" array.');
  }
  if (!Array.isArray(envelope.classifications)) {
    errors.push('Missing or invalid "classifications" array.');
  }

  if (errors.length > 0) {
    return { mode, totalSignals: 0, totalClassifications: 0, importedSignals: 0, importedClassifications: 0, skippedSignals: 0, skippedClassifications: 0, errors };
  }

  const totalSignals = envelope.signals.length;
  const totalClassifications = envelope.classifications.length;

  if (mode === 'replace') {
    await clearSignals(db);
    await clearClassifications(db);
  }

  const validSignals: Signal[] = [];
  let skippedSignals = 0;
  for (const s of envelope.signals) {
    if (validateSignal(s)) {
      validSignals.push(s);
    } else {
      skippedSignals++;
    }
  }

  const validClaims: EntityClassificationClaim[] = [];
  let skippedClassifications = 0;
  for (const c of envelope.classifications) {
    if (validateClaim(c)) {
      validClaims.push(c);
    } else {
      skippedClassifications++;
    }
  }

  if (validSignals.length === 0 && validClaims.length === 0) {
    return {
      mode,
      totalSignals,
      totalClassifications,
      importedSignals: 0,
      importedClassifications: 0,
      skippedSignals,
      skippedClassifications,
      errors: ['No valid records found in import file'],
    };
  }

  if (validSignals.length > 0) {
    await addSignalsBatch(db, validSignals);
  }
  if (validClaims.length > 0) {
    await addClassificationsBatch(db, validClaims);
  }

  return {
    mode,
    totalSignals,
    totalClassifications,
    importedSignals: validSignals.length,
    importedClassifications: validClaims.length,
    skippedSignals,
    skippedClassifications,
    errors: [],
  };
}
