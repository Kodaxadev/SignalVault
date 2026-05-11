import type { Handler } from 'hono';
import type { AppEnv } from '../appEnv';
import { db } from '../db/dbClient';
import { dbEnv } from '../db/dbEnv';
import { suiEnv } from '../character/suiEnv';
import { authEnv } from '../auth/authEnv';
import { getProductionIdentityMode } from '../auth/characterTokenContract';

export const healthHandler: Handler<AppEnv> = (c) => {
  return c.json({
    status: 'ok',
    version: '0.0.1',
    phase: '09L2',
    db: db.isConnected ? 'connected' : 'not_connected',
    writesEnabled: dbEnv.enableRemoteSignalWrites,
    identity: {
      mode: getProductionIdentityMode(),
      suiEnabled: suiEnv.enableSuiCharacterResolution,
      suiGraphqlUrl: suiEnv.enableSuiCharacterResolution ? suiEnv.suiGraphqlUrl : null,
      authDevMode: authEnv.authDevMode,
    },
    requestId: c.get('requestId'),
  });
};
