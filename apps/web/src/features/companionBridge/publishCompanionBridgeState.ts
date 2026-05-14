import type { CompanionBridgeState } from './companionBridgeTypes';
import { loadCompanionBridgeToken } from './companionBridgeToken';

export const companionBridgePublishUrl = 'http://127.0.0.1:17777/state';

type CompanionBridgeFetch = (
  url: string,
  init: {
    method: 'POST';
    headers: Record<string, string>;
    body: string;
  },
) => Promise<{ ok: boolean }>;

interface PublishCompanionBridgeOptions {
  fetcher?: CompanionBridgeFetch;
  token?: string | null;
}

export type CompanionBridgePublishResult =
  | { status: 'published' }
  | { status: 'rejected' }
  | { status: 'disconnected' };

export async function publishCompanionBridgeState(
  state: CompanionBridgeState,
  options: PublishCompanionBridgeOptions = {},
): Promise<CompanionBridgePublishResult> {
  const fetcher = options.fetcher ?? fetch;
  const token = options.token ?? loadCompanionBridgeToken();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (token) {
    headers['x-signal-vault-bridge-token'] = token;
  }

  try {
    const response = await fetcher(companionBridgePublishUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      return { status: 'rejected' };
    }

    return { status: 'published' };
  } catch {
    return { status: 'disconnected' };
  }
}
