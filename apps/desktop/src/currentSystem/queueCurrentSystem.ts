import { invoke } from "@tauri-apps/api/core";
import { parseCurrentSystemDraft } from "./currentSystemDraft";

export type QueueCurrentSystemResult =
  | { readonly status: "queued" }
  | { readonly status: "invalid"; readonly reason: "empty" | "too_long" }
  | { readonly status: "failed" };

type QueueCurrentSystemInvoke = <T>(
  command: string,
  args: { systemInput: string; createdAt: string },
) => Promise<T>;

export async function queueCurrentSystem(
  input: { readonly systemInput: string },
  invoker: QueueCurrentSystemInvoke = invoke,
): Promise<QueueCurrentSystemResult> {
  const draft = parseCurrentSystemDraft(input);
  if ("status" in draft) {
    return draft;
  }

  try {
    await invoker("queue_current_system_command", {
      ...draft,
      createdAt: new Date().toISOString(),
    });
    return { status: "queued" };
  } catch {
    return { status: "failed" };
  }
}
