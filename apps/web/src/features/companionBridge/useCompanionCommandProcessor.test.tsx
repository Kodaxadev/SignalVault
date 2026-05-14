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

const setCurrentSystemCommand: CompanionCommand = {
  id: 'cmd-2',
  type: 'set_current_system',
  createdAt: '2026-05-13T12:10:00.000Z',
  payload: { systemInput: 'OQQ-0R8' },
};

describe('useCompanionCommandProcessor', () => {
  it('ACKs a command only after the local write resolves', async () => {
    const addSignal = vi.fn().mockResolvedValue(undefined);
    const ack = vi.fn().mockResolvedValue({ status: 'acked' });

    renderHook(() =>
      useCompanionCommandProcessor({
        addSignal,
        setCurrentSystem: async () => {},
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
        setCurrentSystem: async () => {},
        ack,
        fetchPending: async () => ({ status: 'commands', commands: [command] }),
        intervalMs: 0,
      }),
    );

    await waitFor(() => expect(addSignal).toHaveBeenCalledTimes(1));
    expect(ack).not.toHaveBeenCalled();
  });

  it('ACKs set current system only after the persisted setter resolves', async () => {
    const setCurrentSystem = vi.fn().mockResolvedValue(undefined);
    const ack = vi.fn().mockResolvedValue({ status: 'acked' });

    renderHook(() =>
      useCompanionCommandProcessor({
        addSignal: async () => {},
        setCurrentSystem,
        ack,
        fetchPending: async () => ({
          status: 'commands',
          commands: [setCurrentSystemCommand],
        }),
        intervalMs: 0,
      }),
    );

    await waitFor(() => expect(setCurrentSystem).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(ack).toHaveBeenCalledWith('cmd-2'));
  });

  it('does not ACK set current system when persistence fails', async () => {
    const setCurrentSystem = vi.fn().mockRejectedValue(new Error('storage_failed'));
    const ack = vi.fn();

    renderHook(() =>
      useCompanionCommandProcessor({
        addSignal: async () => {},
        setCurrentSystem,
        ack,
        fetchPending: async () => ({
          status: 'commands',
          commands: [setCurrentSystemCommand],
        }),
        intervalMs: 0,
      }),
    );

    await waitFor(() => expect(setCurrentSystem).toHaveBeenCalledTimes(1));
    expect(ack).not.toHaveBeenCalled();
  });
});
