import {
  parseCompanionBridgeState,
  type CompanionBridgeState,
} from "./bridgeTypes";

export const companionBridgeStateUrl = "http://127.0.0.1:17777/state";

export type BridgeFetch = (
  url: string,
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export type BridgeReadResult =
  | { status: "connected"; state: CompanionBridgeState }
  | { status: "disconnected" };

export async function fetchCompanionBridgeState(
  fetcher: BridgeFetch = fetch,
  url = companionBridgeStateUrl,
): Promise<BridgeReadResult> {
  try {
    const response = await fetcher(url);
    if (!response.ok) {
      return { status: "disconnected" };
    }

    const state = parseCompanionBridgeState(await response.json());
    return { status: "connected", state };
  } catch {
    return { status: "disconnected" };
  }
}
