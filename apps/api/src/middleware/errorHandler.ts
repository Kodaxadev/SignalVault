import type { ErrorHandler } from 'hono';
import type { AppEnv } from '../appEnv';

export const onError: ErrorHandler<AppEnv> = (err, c) => {
  console.error('[server-error]', err.message);
  const requestId = c.get('requestId') ?? 'unknown';
  return c.json(
    { code: 'server_error', message: 'Internal server error', requestId },
    500
  );
};
