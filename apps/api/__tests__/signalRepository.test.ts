import { describe, it, expect } from 'vitest';
import { buildInsertSignalValues } from '../src/db/signalRepository';
import type { DbInsertSignalInput } from '../src/db/signalRepository';

const base: DbInsertSignalInput = {
  authorCharacterId: 'char-123',
  authorWalletAddress: '0xabc',
  authorTribeId: 'tribe-xyz',
  visibility: 'public',
  signalType: 'gate_recon',
  confidence: 'high',
  title: 'Test signal',
  body: 'Test body text',
  linkedEntities: [],
  createdAt: '2026-05-10T12:00:00.000Z',
};

describe('buildInsertSignalValues', () => {
  it('returns exactly 11 values (matching INSERT_SIGNAL_SQL placeholders)', () => {
    expect(buildInsertSignalValues(base)).toHaveLength(11);
  });

  it('$1 is authorCharacterId', () => {
    expect(buildInsertSignalValues(base)[0]).toBe('char-123');
  });

  it('$1 is null when authorCharacterId is null', () => {
    expect(buildInsertSignalValues({ ...base, authorCharacterId: null })[0]).toBeNull();
  });

  it('$2 is authorWalletAddress', () => {
    expect(buildInsertSignalValues(base)[1]).toBe('0xabc');
  });

  it('$3 is authorTribeId', () => {
    expect(buildInsertSignalValues(base)[2]).toBe('tribe-xyz');
  });

  it('$3 is null when authorTribeId is null', () => {
    expect(buildInsertSignalValues({ ...base, authorTribeId: null })[2]).toBeNull();
  });

  it('$4 is visibility', () => {
    expect(buildInsertSignalValues(base)[3]).toBe('public');
  });

  it('$5 is signalType', () => {
    expect(buildInsertSignalValues(base)[4]).toBe('gate_recon');
  });

  it('$6 is confidence', () => {
    expect(buildInsertSignalValues(base)[5]).toBe('high');
  });

  it('$7 is title', () => {
    expect(buildInsertSignalValues(base)[6]).toBe('Test signal');
  });

  it('$8 is body', () => {
    expect(buildInsertSignalValues(base)[7]).toBe('Test body text');
  });

  it('$9 is linkedEntities serialized as JSON string', () => {
    const vals = buildInsertSignalValues({ ...base, linkedEntities: [{ id: 'e-1' }] });
    expect(vals[8]).toBe('[{"id":"e-1"}]');
  });

  it('$9 is "[]" for empty linkedEntities', () => {
    expect(buildInsertSignalValues(base)[8]).toBe('[]');
  });

  it('$10 is createdAt', () => {
    expect(buildInsertSignalValues(base)[9]).toBe('2026-05-10T12:00:00.000Z');
  });

  it('$11 is null when expiresAt is absent', () => {
    expect(buildInsertSignalValues(base)[10]).toBeNull();
  });

  it('$11 is expiresAt when provided', () => {
    const vals = buildInsertSignalValues({ ...base, expiresAt: '2026-06-01T00:00:00.000Z' });
    expect(vals[10]).toBe('2026-06-01T00:00:00.000Z');
  });
});
