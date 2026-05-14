export const maxCurrentSystemInputLength = 100;

export type CurrentSystemDraft =
  | {
      readonly systemInput: string;
    }
  | {
      readonly status: "invalid";
      readonly reason: "empty" | "too_long";
    };

export function parseCurrentSystemDraft(input: {
  readonly systemInput: string;
}): CurrentSystemDraft {
  const systemInput = input.systemInput.trim();
  if (!systemInput) {
    return { status: "invalid", reason: "empty" };
  }

  if (systemInput.length > maxCurrentSystemInputLength) {
    return { status: "invalid", reason: "too_long" };
  }

  return { systemInput };
}
