import { Hono } from 'hono';
import type { AppEnv } from './appEnv';
import { injectRequestId } from './middleware/requestId';
import { onError } from './middleware/errorHandler';
import { apiCors } from './middleware/apiCors';
import { apiRateLimit } from './middleware/rateLimit';
import { healthHandler } from './health/healthHandler';
import { signalRoutes } from './signals/signalRoutes';
import { challengeRoutes } from './auth/challengeRoutes';

export const app = new Hono<AppEnv>();

app.use('*', injectRequestId);
app.use('/api/*', apiCors);
app.use('/api/*', apiRateLimit);
app.onError(onError);

app.get('/health', healthHandler);
app.route('/api/v1/signals', signalRoutes);
app.route('/api/v1/auth/challenge', challengeRoutes);

app.notFound((c) => {
  return c.json(
    {
      code: 'not_found',
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      requestId: c.get('requestId'),
    },
    404
  );
});

export default app;
