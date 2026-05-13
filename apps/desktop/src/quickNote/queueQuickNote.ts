import { invoke } from "@tauri-apps/api/core";
import { parseQuickNoteDraft } from "./quickNoteDraft";

export type QueueQuickNoteResult =
  | { readonly status: "queued" }
  | { readonly status: "invalid"; readonly reason: "empty" | "too_long" }
  | { readonly status: "failed" };

type QueueQuickNoteInvoke = <T>(
  command: string,
  args: { body: string; createdAt: string; currentSystemName?: string },
) => Promise<T>;

export async function queueQuickNote(
  input: { readonly body: string; readonly currentSystemName?: string },
  invoker: QueueQuickNoteInvoke = invoke,
): Promise<QueueQuickNoteResult> {
  const draft = parseQuickNoteDraft(input);
  if ("status" in draft) {
    return draft;
  }

  try {
    await invoker("queue_quick_note_command", {
      ...draft,
      createdAt: new Date().toISOString(),
    });
    return { status: "queued" };
  } catch {
    return { status: "failed" };
  }
}
