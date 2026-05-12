import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../appEnv';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const ALLOW_HEADERS = [
  'authorization',
  'content-type',
  'x-challenge-id',
  'x-request-id',
  'x-signature-message',
  'x-wallet-address',
  'x-wallet-signature',
];

const ALLOW_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];

function parseOrigins(value: string | undefined): string[] {
  if (!value) return DEFAULT_ALLOWED_ORIGINS;
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveOrigin(origin: string): string | null {
  const allowed = parseOrigins(process.env.API_CORS_ORIGINS);
  if (allowed.includes('*')) return origin || '*';
  return allowed.includes(origin) ? origin : null;
}

export const apiCors: MiddlewareHandler<AppEnv> = async (c, next) => {
  const corsHandler = cors({
    origin: (origin) => resolveOrigin(origin) ?? '',
    allowHeaders: ALLOW_HEADERS,
    allowMethods: ALLOW_METHODS,
    exposeHeaders: ['x-request-id', 'retry-after'],
    maxAge: 600,
  });

  return corsHandler(c, next);
};
