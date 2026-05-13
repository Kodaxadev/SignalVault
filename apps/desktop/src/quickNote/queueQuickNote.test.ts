import { describe, expect, it, vi } from "vitest";
import { queueQuickNote } from "./queueQuickNote";

describe("queueQuickNote", () => {
  it("invokes the native queue command with a trimmed quick note", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
    const invoker = vi.fn().mockResolvedValue(undefined);

    const result = await queueQuickNote(
      { body: "  Hostile contact  ", currentSystemName: "OQQ-0R8" },
      invoker,
    );

    expect(result).toEqual({ status: "queued" });
    expect(invoker).toHaveBeenCalledWith("queue_quick_note_command", {
      body: "Hostile contact",
      createdAt: "2026-05-13T12:00:00.000Z",
      currentSystemName: "OQQ-0R8",
    });
    vi.useRealTimers();
  });

  it("does not invoke native code for invalid notes", async () => {
    const invoker = vi.fn();

    const result = await queueQuickNote({ body: " " }, invoker);

    expect(result).toEqual({ status: "invalid", reason: "empty" });
    expect(invoker).not.toHaveBeenCalled();
  });
});
