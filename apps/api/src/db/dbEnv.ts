// Read once at import time. Restart the server to pick up env changes.
export const dbEnv = {
  databaseUrl: process.env['DATABASE_URL'] as string | undefined,
  enableRemoteSignalWrites: process.env['ENABLE_REMOTE_SIGNAL_WRITES'] === 'true',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
} as const;
