import { describe, expect, it } from 'vitest';
import {
  ackCompanionCommand,
  companionCommandAckUrl,
  companionCommandsPendingUrl,
  fetchPendingCompanionCommands,
  parseCompanionCommands,
} from './companionCommands';

const command = {
  id: 'cmd-1',
  type: 'quick_note',
  createdAt: '2026-05-13T12:00:00.000Z',
  payload: {
    body: 'Gate camp at the out gate',
    currentSystemName: 'OQQ-0R8',
  },
};

describe('parseCompanionCommands', () => {
  it('accepts quick note commands only', () => {
    expect(parseCompanionCommands([command])).toEqual([command]);
  });

  it('rejects wrong command types and invalid note bodies', () => {
    expect(() => parseCompanionCommands([{ ...command, type: 'open_url' }])).toThrow(
      'companion_command_invalid',
    );
    expect(() =>
      parseCompanionCommands([{ ...command, payload: { body: '   ' } }]),
    ).toThrow('companion_command_invalid');
    expect(() =>
      parseCompanionCommands([{ ...command, payload: { body: 'x'.repeat(501) } }]),
    ).toThrow('companion_command_invalid');
  });
});

describe('fetchPendingCompanionCommands', () => {
  it('requires a pairing token for command polling', async () => {
    const fetcher = async () => ({ ok: true, json: async () => [command] });

    const result = await fetchPendingCompanionCommands({ fetcher, token: null });

    expect(result).toEqual({ status: 'unpaired' });
  });

  it('polls pending commands with the bridge token', async () => {
    const calls: unknown[] = [];
    const fetcher = async (...args: unknown[]) => {
      calls.push(args);
      return { ok: true, json: async () => [command] };
    };

    const result = await fetchPendingCompanionCommands({ fetcher, token: 'paired-token' });

    expect(result).toEqual({ status: 'commands', commands: [command] });
    expect(calls).toEqual([
      [
        companionCommandsPendingUrl,
        { method: 'GET', headers: { 'x-signal-vault-bridge-token': 'paired-token' } },
      ],
    ]);
  });
});

describe('ackCompanionCommand', () => {
  it('ACKs only after the caller supplies a command id and token', async () => {
    const calls: unknown[] = [];
    const fetcher = async (...args: unknown[]) => {
      calls.push(args);
      return { ok: true };
    };

    const result = await ackCompanionCommand('cmd-1', { fetcher, token: 'paired-token' });

    expect(result).toEqual({ status: 'acked' });
    expect(calls).toEqual([
      [
        companionCommandAckUrl('cmd-1'),
        { method: 'POST', headers: { 'x-signal-vault-bridge-token': 'paired-token' } },
      ],
    ]);
  });
});
