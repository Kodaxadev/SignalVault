import type { Signal } from '@/features/signals';
import { fetchSolarSystem } from '@/features/worldApi';
import type { WorldApiResult } from '@/features/worldApi';
import type { SystemContext } from '@/features/worldApi/solarSystems/solarSystemExtractors';
import type { CurrentSystem } from '@/features/worldContext';
import type { CompanionCommand, QuickNoteCommand, SetCurrentSystemCommand } from './companionCommands';

interface ApplyCompanionCommandOptions {
  addSignal: (signal: Signal) => Promise<void>;
  setCurrentSystem?: (system: CurrentSystem) => Promise<void> | void;
  fetchSolarSystem?: (systemId: string) => Promise<WorldApiResult<SystemContext>>;
  now?: Date;
}

export async function applyCompanionCommand(
  command: CompanionCommand,
  options: ApplyCompanionCommandOptions,
): Promise<void> {
  if (command.type === 'set_current_system') {
    await applySetCurrentSystemCommand(command, options);
    return;
  }

  if (command.type === 'quick_note') {
    await applyQuickNoteCommand(command, options);
    return;
  }

  throw new Error('companion_command_unsupported');
}

async function applyQuickNoteCommand(
  command: QuickNoteCommand,
  options: ApplyCompanionCommandOptions,
): Promise<void> {
  const body = command.payload.body.trim();
  if (!body) {
    throw new Error('quick_note_empty');
  }

  await options.addSignal(buildQuickNoteSignal(command, body, options.now ?? new Date()));
}

async function applySetCurrentSystemCommand(
  command: SetCurrentSystemCommand,
  options: ApplyCompanionCommandOptions,
): Promise<void> {
  if (!options.setCurrentSystem) {
    throw new Error('current_system_setter_missing');
  }

  const system = await resolveCurrentSystem(command.payload.systemInput, {
    fetchSolarSystem: options.fetchSolarSystem ?? fetchSolarSystem,
    now: options.now ?? new Date(),
  });

  await options.setCurrentSystem(system);
}

async function resolveCurrentSystem(
  input: string,
  options: {
    fetchSolarSystem: (systemId: string) => Promise<WorldApiResult<SystemContext>>;
    now: Date;
  },
): Promise<CurrentSystem> {
  const trimmed = input.trim();
  const setAt = options.now.toISOString();

  if (/^\d+$/.test(trimmed)) {
    const result = await fetchSystemOrUnavailable(options.fetchSolarSystem, trimmed);
    if (result.status === 'loaded') {
      return {
        systemId: result.data.id,
        systemName: result.data.name,
        source: 'world_api',
        setAt,
      };
    }
  }

  return {
    systemId: trimmed,
    systemName: trimmed,
    source: 'manual',
    setAt,
  };
}

async function fetchSystemOrUnavailable(
  fetchSolarSystemById: (systemId: string) => Promise<WorldApiResult<SystemContext>>,
  systemId: string,
): Promise<WorldApiResult<SystemContext>> {
  try {
    return await fetchSolarSystemById(systemId);
  } catch {
    return { status: 'unavailable', reason: 'fetch_failed' };
  }
}

function buildQuickNoteSignal(command: QuickNoteCommand, body: string, now: Date): Signal {
  const nowStr = now.toISOString();
  const systemName = command.payload.currentSystemName?.trim();

  return {
    id: `desktop-note-${command.id}`,
    title: 'Desktop Quick Note',
    body,
    signalType: 'field_note',
    confidence: 'unverified',
    visibility: 'local_private',
    syncState: 'local_only',
    author: { kind: 'anonymous_local' },
    linkedEntities: systemName
      ? [
          {
            entityId: `system:${systemName}`,
            type: 'system',
            label: systemName,
            resolutionConfidence: 'manual',
          },
        ]
      : [],
    createdInContext: {
      surface: 'external_app',
      viewerState: 'desktop_companion',
    },
    tags: ['desktop_companion'],
    createdAt: command.createdAt || nowStr,
    updatedAt: nowStr,
  };
}
