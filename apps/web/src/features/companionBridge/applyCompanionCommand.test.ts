import { describe, expect, it } from 'vitest';
import type { Signal } from '@/features/signals';
import { applyCompanionCommand } from './applyCompanionCommand';
import type { CompanionCommand } from './companionCommands';

const command: CompanionCommand = {
  id: 'cmd-1',
  type: 'quick_note',
  createdAt: '2026-05-13T12:00:00.000Z',
  payload: {
    body: 'Hostile contact near the node',
    currentSystemName: 'OQQ-0R8',
  },
};

describe('applyCompanionCommand', () => {
  it('creates a local-only field note for quick note commands', async () => {
    const saved: Signal[] = [];

    await applyCompanionCommand(command, {
      addSignal: async (signal) => {
        saved.push(signal);
      },
      now: new Date('2026-05-13T12:05:00.000Z'),
    });

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      title: 'Desktop Quick Note',
      body: 'Hostile contact near the node',
      signalType: 'field_note',
      confidence: 'unverified',
      visibility: 'local_private',
      syncState: 'local_only',
      author: { kind: 'anonymous_local' },
      createdInContext: {
        surface: 'external_app',
        viewerState: 'desktop_companion',
      },
      tags: ['desktop_companion'],
    });
    expect(saved[0]?.linkedEntities).toEqual([
      {
        entityId: 'system:OQQ-0R8',
        type: 'system',
        label: 'OQQ-0R8',
        resolutionConfidence: 'manual',
      },
    ]);
  });

  it('does not save empty quick notes', async () => {
    const emptyCommand = { ...command, payload: { body: '   ' } };
    let saved = false;

    await expect(
      applyCompanionCommand(emptyCommand, {
        addSignal: async () => {
          saved = true;
        },
      }),
    ).rejects.toThrow('quick_note_empty');

    expect(saved).toBe(false);
  });
});
