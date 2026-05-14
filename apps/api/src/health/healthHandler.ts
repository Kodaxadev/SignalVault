import type { Handler } from 'hono';
import type { AppEnv } from '../appEnv';
import { db } from '../db/dbClient';
import { dbEnv } from '../db/dbEnv';
import { suiEnv } from '../character/suiEnv';
import { authEnv } from '../auth/authEnv';
import { getProductionIdentityMode } from '../auth/characterTokenContract';
import { checkMigrationStatus } from '../db/migrationStatus';

export const healthHandler: Handler<AppEnv> = async (c) => {
  const migrations = await checkMigrationStatus();

  return c.json({
    status: 'ok',
    version: '0.0.1',
    phase: '09L2',
    db: db.isConnected ? 'connected' : 'not_connected',
    writesEnabled: dbEnv.enableRemoteSignalWrites,
    readiness: {
      database: db.isConnected ? 'configured' : 'not_configured',
      migrations,
      remoteWrites: dbEnv.enableRemoteSignalWrites ? 'enabled' : 'disabled',
    },
    identity: {
      mode: getProductionIdentityMode(),
      suiEnabled: suiEnv.enableSuiCharacterResolution,
      suiGraphqlUrl: suiEnv.enableSuiCharacterResolution ? suiEnv.suiGraphqlUrl : null,
      authDevMode: authEnv.authDevMode,
    },
    requestId: c.get('requestId'),
  });
};
