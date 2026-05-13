import { describe, expect, it } from 'vitest';
import type { Signal } from '@/features/signals';
import type { CurrentSystem } from '@/features/worldContext';
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

const setCurrentSystemCommand: CompanionCommand = {
  id: 'cmd-2',
  type: 'set_current_system',
  createdAt: '2026-05-13T12:10:00.000Z',
  payload: {
    systemInput: '30000142',
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

  it('sets a World API verified current system for numeric input', async () => {
    const systems: CurrentSystem[] = [];

    await applyCompanionCommand(setCurrentSystemCommand, {
      addSignal: async () => {},
      setCurrentSystem: async (system) => {
        systems.push(system);
      },
      fetchSolarSystem: async () => ({
        status: 'loaded',
        data: {
          id: '30000142',
          name: 'OQQ-0R8',
          regionId: '1',
          constellationId: '2',
          connectedSystemIds: [],
        },
      }),
      now: new Date('2026-05-13T12:15:00.000Z'),
    });

    expect(systems).toEqual([
      {
        systemId: '30000142',
        systemName: 'OQQ-0R8',
        source: 'world_api',
        setAt: '2026-05-13T12:15:00.000Z',
      },
    ]);
  });

  it('falls back to manual current system when lookup is unavailable', async () => {
    const systems: CurrentSystem[] = [];

    await applyCompanionCommand(setCurrentSystemCommand, {
      addSignal: async () => {},
      setCurrentSystem: async (system) => {
        systems.push(system);
      },
      fetchSolarSystem: async () => ({ status: 'unavailable', reason: 'not_found' }),
      now: new Date('2026-05-13T12:15:00.000Z'),
    });

    expect(systems[0]).toMatchObject({
      systemId: '30000142',
      systemName: '30000142',
      source: 'manual',
    });
  });

  it('falls back to manual current system when lookup throws', async () => {
    const systems: CurrentSystem[] = [];

    await applyCompanionCommand(setCurrentSystemCommand, {
      addSignal: async () => {},
      setCurrentSystem: async (system) => {
        systems.push(system);
      },
      fetchSolarSystem: async () => {
        throw new Error('world_api_unavailable');
      },
      now: new Date('2026-05-13T12:15:00.000Z'),
    });

    expect(systems[0]).toMatchObject({
      systemId: '30000142',
      systemName: '30000142',
      source: 'manual',
    });
  });
});
