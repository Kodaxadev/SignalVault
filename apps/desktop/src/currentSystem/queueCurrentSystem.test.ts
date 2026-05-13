import { describe, expect, it, vi } from "vitest";
import { queueCurrentSystem } from "./queueCurrentSystem";

describe("queueCurrentSystem", () => {
  it("invokes the native queue command with trimmed system input", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T12:20:00.000Z"));
    const invoker = vi.fn().mockResolvedValue(undefined);

    const result = await queueCurrentSystem({ systemInput: "  30000142  " }, invoker);

    expect(result).toEqual({ status: "queued" });
    expect(invoker).toHaveBeenCalledWith("queue_current_system_command", {
      systemInput: "30000142",
      createdAt: "2026-05-13T12:20:00.000Z",
    });
    vi.useRealTimers();
  });

  it("does not invoke native code for invalid current system input", async () => {
    const invoker = vi.fn();

    const result = await queueCurrentSystem({ systemInput: " " }, invoker);

    expect(result).toEqual({ status: "invalid", reason: "empty" });
    expect(invoker).not.toHaveBeenCalled();
  });
});
