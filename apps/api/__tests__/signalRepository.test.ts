import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildInsertSignalValues, findSignalById, insertSignal, listSignals } from '../src/db/signalRepository';
import type { DbInsertSignalInput } from '../src/db/signalRepository';

vi.mock('../src/db/dbClient', () => ({ getPool: vi.fn() }));

import { getPool } from '../src/db/dbClient';

const mockGetPool = vi.mocked(getPool);

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

function makeClient(rows: unknown[] = []) {
  return {
    query: vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows }),
    release: vi.fn(),
  };
}

function makePool(client: ReturnType<typeof makeClient>) {
  return {
    connect: vi.fn().mockResolvedValue(client),
  };
}

beforeEach(() => {
  mockGetPool.mockReset();
});

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

describe('signalRepository RLS context', () => {
  it('sets character and tribe session context before listing signals', async () => {
    const client = makeClient([]);
    mockGetPool.mockReturnValue(makePool(client) as never);

    await listSignals({ characterId: 'char-1', tribeId: 'tribe-1' });

    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('set_config'),
      ['char-1', 'tribe-1']
    );
    expect(client.query).toHaveBeenNthCalledWith(
      3,
      'SELECT * FROM signals ORDER BY created_at DESC LIMIT 50'
    );
    expect(client.query).toHaveBeenNthCalledWith(4, 'COMMIT');
    expect(client.release).toHaveBeenCalled();
  });

  it('sets RLS session context before finding one signal', async () => {
    const client = makeClient([]);
    mockGetPool.mockReturnValue(makePool(client) as never);

    await findSignalById('sig-1', { characterId: 'char-1', tribeId: null });

    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('set_config'),
      ['char-1', '']
    );
    expect(client.query).toHaveBeenNthCalledWith(
      3,
      'SELECT * FROM signals WHERE id = $1',
      ['sig-1']
    );
  });

  it('sets RLS session context before inserting one signal', async () => {
    const client = makeClient([{ id: 'sig-1' }]);
    mockGetPool.mockReturnValue(makePool(client) as never);

    await insertSignal(base);

    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('set_config'),
      ['char-123', 'tribe-xyz']
    );
    expect(client.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INSERT INTO signals'),
      buildInsertSignalValues(base)
    );
  });
});
