import { serve } from '@hono/node-server';
import { app } from './server';
import { validateApiEnv } from './env/validateApiEnv';

const envValidation = validateApiEnv();

if (!envValidation.ok) {
  for (const error of envValidation.errors) {
    console.error(`[signal-vault-api] env error: ${error}`);
  }
  process.exit(1);
}

const port = Number(process.env['PORT'] ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[signal-vault-api] listening on http://localhost:${info.port}`);
});
