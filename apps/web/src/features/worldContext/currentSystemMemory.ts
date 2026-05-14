import type { CurrentSystem } from './currentSystemTypes';

const STORAGE_KEY = 'signal-vault:current-system';

export function loadCurrentSystem(): CurrentSystem | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isCurrentSystem(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCurrentSystem(system: CurrentSystem): void {
  try {
    saveCurrentSystemStrict(system);
  } catch {
    // Storage unavailable — no-op
  }
}

export function saveCurrentSystemStrict(system: CurrentSystem): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(system));
}

export function clearCurrentSystemMemory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — no-op
  }
}

function isCurrentSystem(value: unknown): value is CurrentSystem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['systemId'] === 'string' &&
    typeof v['systemName'] === 'string' &&
    typeof v['setAt'] === 'string' &&
    (v['source'] === 'world_api' || v['source'] === 'manual')
  );
}
