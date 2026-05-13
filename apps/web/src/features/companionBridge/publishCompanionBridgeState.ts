import type { CompanionBridgeState } from './companionBridgeTypes';

export const companionBridgePublishUrl = 'http://127.0.0.1:17777/state';

type CompanionBridgeFetch = (
  url: string,
  init: {
    method: 'POST';
    headers: { 'content-type': 'application/json' };
    body: string;
  },
) => Promise<{ ok: boolean }>;

export type CompanionBridgePublishResult =
  | { status: 'published' }
  | { status: 'rejected' }
  | { status: 'disconnected' };

export async function publishCompanionBridgeState(
  state: CompanionBridgeState,
  fetcher: CompanionBridgeFetch = fetch,
): Promise<CompanionBridgePublishResult> {
  try {
    const response = await fetcher(companionBridgePublishUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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
