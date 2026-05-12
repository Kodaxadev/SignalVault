import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db/dbClient', () => ({ getPool: vi.fn() }));

import { getPool } from '../src/db/dbClient';
import {
  LATEST_REQUIRED_MIGRATION,
  checkMigrationStatus,
} from '../src/db/migrationStatus';

const mockGetPool = vi.mocked(getPool);

function makePool(tableRows: unknown[], columnRows: unknown[]) {
  return {
    query: vi.fn()
      .mockResolvedValueOnce({ rows: tableRows })
      .mockResolvedValueOnce({ rows: columnRows }),
  };
}

const currentTables = [
  { table_name: 'signals' },
  { table_name: 'audit_log' },
  { table_name: 'auth_challenges' },
];

const currentColumns = [
  { table_name: 'signals', column_name: 'author_character_name' },
  { table_name: 'signals', column_name: 'identity_resolved_at' },
  { table_name: 'audit_log', column_name: 'identity_source' },
  { table_name: 'audit_log', column_name: 'actor_character_name' },
  { table_name: 'audit_log', column_name: 'identity_resolved_at' },
];

beforeEach(() => {
  mockGetPool.mockReset();
});

describe('checkMigrationStatus', () => {
  it('reports not_configured when DATABASE_URL is absent', async () => {
    mockGetPool.mockReturnValue(null);

    await expect(checkMigrationStatus()).resolves.toEqual({
      status: 'not_configured',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    });
  });

  it('reports current when required tables and columns exist', async () => {
    mockGetPool.mockReturnValue(makePool(currentTables, currentColumns) as never);

    await expect(checkMigrationStatus()).resolves.toEqual({
      status: 'current',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    });
  });

  it('reports missing tables and columns when schema is stale', async () => {
    mockGetPool.mockReturnValue(makePool(
      [{ table_name: 'signals' }, { table_name: 'audit_log' }],
      currentColumns.filter((row) => row.column_name !== 'identity_resolved_at')
    ) as never);

    await expect(checkMigrationStatus()).resolves.toEqual({
      status: 'outdated',
      latestRequired: LATEST_REQUIRED_MIGRATION,
      missing: [
        'auth_challenges',
        'signals.identity_resolved_at',
        'audit_log.identity_resolved_at',
      ],
    });
  });

  it('reports unreachable when schema introspection fails', async () => {
    mockGetPool.mockReturnValue({
      query: vi.fn().mockRejectedValue(new Error('network down')),
    } as never);

    await expect(checkMigrationStatus()).resolves.toEqual({
      status: 'unreachable',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    });
  });
});
