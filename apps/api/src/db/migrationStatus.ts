import { getPool } from './dbClient';

export const LATEST_REQUIRED_MIGRATION = '004_add_identity_snapshot_fields';

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
    const missing = findMissingSchemaItems(
      tableResult.rows as SchemaRow[],
      columnResult.rows as SchemaRow[]
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
  columnRows: SchemaRow[]
): string[] {
  const foundTables = new Set(tableRows.map((row) => row.table_name));
  const foundColumns = new Set(
    columnRows.map((row) => `${row.table_name}.${row.column_name ?? ''}`)
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

  return missing;
}
