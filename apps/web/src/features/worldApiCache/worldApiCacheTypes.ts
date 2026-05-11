export type CachedWorldApiResult<T> =
  | { status: 'loaded'; source: 'network' | 'cache'; data: T }
  | { status: 'stale_fallback'; source: 'cache'; data: T; staleSince: string }
  | { status: 'unavailable'; source: 'none'; reason: string };
