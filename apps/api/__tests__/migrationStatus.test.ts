import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db/dbClient', () => ({ getPool: vi.fn() }));

import { getPool } from '../src/db/dbClient';
import {
  LATEST_REQUIRED_MIGRATION,
  checkMigrationStatus,
} from '../src/db/migrationStatus';

const mockGetPool = vi.mocked(getPool);

function makePool(
  tableRows: unknown[],
  columnRows: unknown[],
  policyRows = currentPolicies,
  constraintRows = currentConstraints
) {
  return {
    query: vi.fn()
      .mockResolvedValueOnce({ rows: tableRows })
      .mockResolvedValueOnce({ rows: columnRows })
      .mockResolvedValueOnce({ rows: policyRows })
      .mockResolvedValueOnce({ rows: constraintRows }),
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

const currentPolicies = [
  { tablename: 'signals', policyname: 'signal_read_scope' },
  { tablename: 'signals', policyname: 'signal_insert_auth' },
  { tablename: 'signals', policyname: 'signal_update_auth' },
  { tablename: 'signals', policyname: 'signal_delete_auth' },
  { tablename: 'audit_log', policyname: 'audit_append' },
  { tablename: 'audit_log', policyname: 'audit_read' },
];

const currentConstraints = [
  {
    table_name: 'signals',
    constraint_name: 'signals_identity_resolved_at_required_for_character',
  },
  {
    table_name: 'audit_log',
    constraint_name: 'audit_identity_source_required_for_character',
  },
  {
    table_name: 'audit_log',
    constraint_name: 'audit_identity_resolved_at_required_for_character',
  },
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

  it('reports current when required tables, columns, policies, and constraints exist', async () => {
    mockGetPool.mockReturnValue(makePool(currentTables, currentColumns) as never);

    await expect(checkMigrationStatus()).resolves.toEqual({
      status: 'current',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    });
  });

  it('reports missing policies and constraints when migration 005 is stale', async () => {
    mockGetPool.mockReturnValue(makePool(
      currentTables,
      currentColumns,
      currentPolicies.filter((row) => row.policyname !== 'signal_insert_auth'),
      currentConstraints.filter((row) =>
        row.constraint_name !== 'audit_identity_source_required_for_character'
      )
    ) as never);

    await expect(checkMigrationStatus()).resolves.toEqual({
      status: 'outdated',
      latestRequired: LATEST_REQUIRED_MIGRATION,
      missing: [
        'signals.policy.signal_insert_auth',
        'audit_log.constraint.audit_identity_source_required_for_character',
      ],
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
