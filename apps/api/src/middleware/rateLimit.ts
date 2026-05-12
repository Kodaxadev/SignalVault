import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../appEnv';

interface RateLimitBucket {
  count: number;
  resetsAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

function numericEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headers.get('x-real-ip') ?? 'unknown';
}

function retryAfterSeconds(resetsAt: number, now: number): string {
  return String(Math.max(1, Math.ceil((resetsAt - now) / 1000)));
}

export function _clearRateLimitStore(): void {
  buckets.clear();
}

export const apiRateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    await next();
    return;
  }

  const max = numericEnv('API_RATE_LIMIT_MAX', 120);
  const windowMs = numericEnv('API_RATE_LIMIT_WINDOW_MS', 60_000);
  const now = Date.now();
  const key = clientKey(c.req.raw.headers);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    await next();
    return;
  }

  if (bucket.count >= max) {
    const retryAfter = retryAfterSeconds(bucket.resetsAt, now);
    c.header('retry-after', retryAfter);
    return c.json(
      {
        code: 'rate_limited',
        message: 'Too many requests',
        requestId: c.get('requestId'),
      },
      429
    );
  }

  bucket.count += 1;
  await next();
};
