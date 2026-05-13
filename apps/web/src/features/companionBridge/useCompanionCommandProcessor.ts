import { useEffect, useRef } from 'react';
import type { Signal } from '@/features/signals';
import { applyCompanionCommand } from './applyCompanionCommand';
import {
  ackCompanionCommand,
  fetchPendingCompanionCommands,
  type CommandAckResult,
  type PendingCommandResult,
} from './companionCommands';

interface UseCompanionCommandProcessorInput {
  addSignal: (signal: Signal) => Promise<void>;
  enabled?: boolean;
  intervalMs?: number;
  fetchPending?: () => Promise<PendingCommandResult>;
  ack?: (id: string) => Promise<CommandAckResult>;
}

export function useCompanionCommandProcessor({
  addSignal,
  enabled = true,
  intervalMs = 3000,
  fetchPending = fetchPendingCompanionCommands,
  ack = ackCompanionCommand,
}: UseCompanionCommandProcessorInput): void {
  const processingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function pollOnce() {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const result = await fetchPending();
        if (cancelled || result.status !== 'commands') return;

        for (const command of result.commands) {
          try {
            await applyCompanionCommand(command, { addSignal });
            await ack(command.id);
          } catch {
            // Leave the command pending so a later local write can retry safely.
          }
        }
      } finally {
        processingRef.current = false;
      }
    }

    void pollOnce();
    if (intervalMs <= 0) return () => {
      cancelled = true;
    };

    const interval = window.setInterval(() => void pollOnce(), intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [ack, addSignal, enabled, fetchPending, intervalMs]);
}
