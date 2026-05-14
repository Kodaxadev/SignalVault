import { getPool } from './dbClient';

export const LATEST_REQUIRED_MIGRATION = '005_harden_signal_rls';

const REQUIRED_TABLES = [
  'signals',
  'audit_log',
  'auth_challenges',
] as const;

const REQUIRED_COLUMNS = [
  { tableName: 'signals', columnName: 'author_character_name' },
  { tableName: 'signals', columnName: 'identity_resolved_at' },
  { tableName: 'audit_log', columnName: 'identity_source' },
  { tableName: 'audit_log', columnName: 'actor_character_name' },
  { tableName: 'audit_log', columnName: 'identity_resolved_at' },
] as const;

const REQUIRED_POLICIES = [
  { tableName: 'signals', policyName: 'signal_read_scope' },
  { tableName: 'signals', policyName: 'signal_insert_auth' },
  { tableName: 'signals', policyName: 'signal_update_auth' },
  { tableName: 'signals', policyName: 'signal_delete_auth' },
  { tableName: 'audit_log', policyName: 'audit_append' },
  { tableName: 'audit_log', policyName: 'audit_read' },
] as const;

const REQUIRED_CONSTRAINTS = [
  {
    tableName: 'signals',
    constraintName: 'signals_identity_resolved_at_required_for_character',
  },
  {
    tableName: 'audit_log',
    constraintName: 'audit_identity_source_required_for_character',
  },
  {
    tableName: 'audit_log',
    constraintName: 'audit_identity_resolved_at_required_for_character',
  },
] as const;

type MigrationStatusBase = {
  latestRequired: typeof LATEST_REQUIRED_MIGRATION;
};

export type MigrationStatus =
  | (MigrationStatusBase & { status: 'not_configured' })
  | (MigrationStatusBase & { status: 'current' })
  | (MigrationStatusBase & { status: 'outdated'; missing: string[] })
  | (MigrationStatusBase & { status: 'unreachable' });

type SchemaRow = {
  table_name: string;
  column_name?: string;
  tablename?: string;
  policyname?: string;
  constraint_name?: string;
};

const REQUIRED_TABLES_SQL = `
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = ANY($1)
`;

const REQUIRED_COLUMNS_SQL = `
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = ANY($1)
`;

const REQUIRED_POLICIES_SQL = `
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = ANY($1)
`;

const REQUIRED_CONSTRAINTS_SQL = `
SELECT table_name, constraint_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = ANY($1)
`;

export async function checkMigrationStatus(): Promise<MigrationStatus> {
  const pool = getPool();
  if (!pool) {
    return {
      status: 'not_configured',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    };
  }

  try {
    const tableResult = await pool.query(REQUIRED_TABLES_SQL, [REQUIRED_TABLES]);
    const columnResult = await pool.query(REQUIRED_COLUMNS_SQL, [REQUIRED_TABLES]);
    const policyResult = await pool.query(REQUIRED_POLICIES_SQL, [REQUIRED_TABLES]);
    const constraintResult = await pool.query(REQUIRED_CONSTRAINTS_SQL, [REQUIRED_TABLES]);
    const missing = findMissingSchemaItems(
      tableResult.rows as SchemaRow[],
      columnResult.rows as SchemaRow[],
      policyResult.rows as SchemaRow[],
      constraintResult.rows as SchemaRow[]
    );

    if (missing.length > 0) {
      return {
        status: 'outdated',
        latestRequired: LATEST_REQUIRED_MIGRATION,
        missing,
      };
    }

    return {
      status: 'current',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    };
  } catch {
    return {
      status: 'unreachable',
      latestRequired: LATEST_REQUIRED_MIGRATION,
    };
  }
}

export function findMissingSchemaItems(
  tableRows: SchemaRow[],
  columnRows: SchemaRow[],
  policyRows: SchemaRow[] = [],
  constraintRows: SchemaRow[] = []
): string[] {
  const foundTables = new Set(tableRows.map((row) => row.table_name));
  const foundColumns = new Set(
    columnRows.map((row) => `${row.table_name}.${row.column_name ?? ''}`)
  );
  const foundPolicies = new Set(
    policyRows.map((row) => `${row.tablename ?? ''}.${row.policyname ?? ''}`)
  );
  const foundConstraints = new Set(
    constraintRows.map((row) => `${row.table_name}.${row.constraint_name ?? ''}`)
  );
  const missing: string[] = [];

  for (const tableName of REQUIRED_TABLES) {
    if (!foundTables.has(tableName)) missing.push(tableName);
  }

  for (const { tableName, columnName } of REQUIRED_COLUMNS) {
    if (!foundTables.has(tableName)) continue;
    const key = `${tableName}.${columnName}`;
    if (!foundColumns.has(key)) missing.push(key);
  }

  for (const { tableName, policyName } of REQUIRED_POLICIES) {
    if (!foundTables.has(tableName)) continue;
    const key = `${tableName}.${policyName}`;
    if (!foundPolicies.has(key)) missing.push(`${tableName}.policy.${policyName}`);
  }

  for (const { tableName, constraintName } of REQUIRED_CONSTRAINTS) {
    if (!foundTables.has(tableName)) continue;
    const key = `${tableName}.${constraintName}`;
    if (!foundConstraints.has(key)) {
      missing.push(`${tableName}.constraint.${constraintName}`);
    }
  }

  return missing;
}
