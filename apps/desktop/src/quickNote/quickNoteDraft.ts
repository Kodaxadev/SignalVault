export const maxQuickNoteLength = 500;

export type QuickNoteDraft =
  | {
      readonly body: string;
      readonly currentSystemName?: string;
    }
  | {
      readonly status: "invalid";
      readonly reason: "empty" | "too_long";
    };

export function parseQuickNoteDraft(input: {
  readonly body: string;
  readonly currentSystemName?: string;
}): QuickNoteDraft {
  const body = input.body.trim();
  if (!body) {
    return { status: "invalid", reason: "empty" };
  }

  if (body.length > maxQuickNoteLength) {
    return { status: "invalid", reason: "too_long" };
  }

  return {
    body,
    currentSystemName: input.currentSystemName?.trim() || undefined,
  };
}
