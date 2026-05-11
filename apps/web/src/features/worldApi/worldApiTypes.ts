import type { WorldApiError } from './worldApiErrors';

export type WorldApiResult<T> =
  | { status: 'loaded'; data: T }
  | { status: 'unavailable'; reason: string; error?: WorldApiError };

export function worldApiLoaded<T>(data: T): WorldApiResult<T> {
  return { status: 'loaded', data };
}

export function worldApiUnavailable<T>(reason: string, error?: WorldApiError): WorldApiResult<T> {
  return { status: 'unavailable', reason, error };
}
