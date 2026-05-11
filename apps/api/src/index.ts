import { serve } from '@hono/node-server';
import { app } from './server';

const port = Number(process.env['PORT'] ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[signal-vault-api] listening on http://localhost:${info.port}`);
});
