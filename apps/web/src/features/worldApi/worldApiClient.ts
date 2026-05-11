import { getWorldApiBaseUrl } from './worldApiConfig';
import { WorldApiError } from './worldApiErrors';
import type { WorldApiResult } from './worldApiTypes';
import { worldApiLoaded, worldApiUnavailable } from './worldApiTypes';

const DEFAULT_TIMEOUT_MS = 8_000;

export async function worldApiGet<T>(
  path: string,
  options?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<WorldApiResult<T>> {
  const baseUrl = getWorldApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: options?.signal ?? controller.signal,
    });

    if (!response.ok) {
      return worldApiUnavailable(
        `HTTP ${response.status}`,
        new WorldApiError(`HTTP ${response.status}`, response.status, path),
      );
    }

    const data = (await response.json()) as T;
    return worldApiLoaded(data);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return worldApiUnavailable('timeout', new WorldApiError('Request timed out', undefined, path));
    }
    const message = err instanceof Error ? err.message : String(err);
    return worldApiUnavailable(
      message,
      new WorldApiError(message, undefined, path),
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
