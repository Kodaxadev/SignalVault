import { invoke } from "@tauri-apps/api/core";

export type BridgeHostStatus = "running" | "port_conflict" | "failed" | "unknown";

export async function getBridgeHostStatus(): Promise<BridgeHostStatus> {
  try {
    const status = await invoke<string>("get_bridge_host_status");

    if (
      status === "running" ||
      status === "port_conflict" ||
      status === "failed"
    ) {
      return status;
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

export function formatBridgeHostStatus(status: BridgeHostStatus): string {
  if (status === "running") {
    return "running";
  }

  if (status === "port_conflict") {
    return "port conflict on 127.0.0.1:17777";
  }

  if (status === "failed") {
    return "failed";
  }

  return "unknown";
}
