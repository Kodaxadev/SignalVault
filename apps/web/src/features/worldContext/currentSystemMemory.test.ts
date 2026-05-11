import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCurrentSystem,
  saveCurrentSystem,
  clearCurrentSystemMemory,
} from './currentSystemMemory';
import type { CurrentSystem } from './currentSystemTypes';

const SYSTEM: CurrentSystem = {
  systemId: '30000001',
  systemName: 'A 2560',
  source: 'world_api',
  setAt: '2026-05-11T10:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
});

describe('loadCurrentSystem', () => {
  it('returns null when nothing is stored', () => {
    expect(loadCurrentSystem()).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('signal-vault:current-system', 'not-json');
    expect(loadCurrentSystem()).toBeNull();
  });

  it('returns null for an object missing required fields', () => {
    localStorage.setItem('signal-vault:current-system', JSON.stringify({ systemId: '123' }));
    expect(loadCurrentSystem()).toBeNull();
  });

  it('returns null for unknown source value', () => {
    localStorage.setItem(
      'signal-vault:current-system',
      JSON.stringify({ ...SYSTEM, source: 'unknown_source' })
    );
    expect(loadCurrentSystem()).toBeNull();
  });

  it('returns the stored system after save', () => {
    saveCurrentSystem(SYSTEM);
    expect(loadCurrentSystem()).toEqual(SYSTEM);
  });

  it('returns a manual-source system correctly', () => {
    const manual: CurrentSystem = { ...SYSTEM, source: 'manual', systemName: 'MySystem' };
    saveCurrentSystem(manual);
    expect(loadCurrentSystem()).toEqual(manual);
  });
});

describe('clearCurrentSystemMemory', () => {
  it('removes the stored system', () => {
    saveCurrentSystem(SYSTEM);
    clearCurrentSystemMemory();
    expect(loadCurrentSystem()).toBeNull();
  });

  it('does not throw when nothing is stored', () => {
    expect(() => clearCurrentSystemMemory()).not.toThrow();
  });
});
