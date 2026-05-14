import { invoke } from "@tauri-apps/api/core";

export type BridgePairingResult =
  | { status: "paired"; token: string }
  | { status: "unavailable" };

type BridgePairingInvoke = <T>(command: string) => Promise<T>;

export async function getBridgePairingToken(
  invoker: BridgePairingInvoke = invoke,
): Promise<BridgePairingResult> {
  try {
    const token = await invoker<string>("get_bridge_pairing_token");
    if (typeof token !== "string" || token.length === 0) {
      return { status: "unavailable" };
    }

    return { status: "paired", token };
  } catch {
    return { status: "unavailable" };
  }
}

export function formatBridgePairingToken(result: BridgePairingResult): string {
  if (result.status === "unavailable") {
    return "unavailable";
  }

  return result.token;
}
