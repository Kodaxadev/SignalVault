export type BridgeConnectionStatus = "connected" | "disconnected";

export function formatBridgeStatus(status: BridgeConnectionStatus): string {
  if (status === "connected") {
    return "Bridge: connected";
  }

  return "Bridge: disconnected - Open Signal Vault in browser to provide live state.";
}
