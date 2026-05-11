import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../appEnv';

export const injectRequestId: MiddlewareHandler<AppEnv> = async (c, next) => {
  const id = c.req.header('x-request-id') ?? crypto.randomUUID();
  c.set('requestId', id);
  await next();
  c.header('x-request-id', id);
};
