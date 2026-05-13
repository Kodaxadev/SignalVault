import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CompanionCommand } from './companionCommands';
import { useCompanionCommandProcessor } from './useCompanionCommandProcessor';

const command: CompanionCommand = {
  id: 'cmd-1',
  type: 'quick_note',
  createdAt: '2026-05-13T12:00:00.000Z',
  payload: { body: 'Hostile contact at node' },
};

describe('useCompanionCommandProcessor', () => {
  it('ACKs a command only after the local write resolves', async () => {
    const addSignal = vi.fn().mockResolvedValue(undefined);
    const ack = vi.fn().mockResolvedValue({ status: 'acked' });

    renderHook(() =>
      useCompanionCommandProcessor({
        addSignal,
        ack,
        fetchPending: async () => ({ status: 'commands', commands: [command] }),
        intervalMs: 0,
      }),
    );

    await waitFor(() => expect(addSignal).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(ack).toHaveBeenCalledWith('cmd-1'));
  });

  it('does not ACK when the local write fails', async () => {
    const addSignal = vi.fn().mockRejectedValue(new Error('db_failed'));
    const ack = vi.fn();

    renderHook(() =>
      useCompanionCommandProcessor({
        addSignal,
        ack,
        fetchPending: async () => ({ status: 'commands', commands: [command] }),
        intervalMs: 0,
      }),
    );

    await waitFor(() => expect(addSignal).toHaveBeenCalledTimes(1));
    expect(ack).not.toHaveBeenCalled();
  });
});
