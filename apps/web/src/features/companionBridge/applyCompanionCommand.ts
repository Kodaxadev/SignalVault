import type { Signal } from '@/features/signals';
import type { CompanionCommand } from './companionCommands';

interface ApplyCompanionCommandOptions {
  addSignal: (signal: Signal) => Promise<void>;
  now?: Date;
}

export async function applyCompanionCommand(
  command: CompanionCommand,
  options: ApplyCompanionCommandOptions,
): Promise<void> {
  if (command.type !== 'quick_note') {
    throw new Error('companion_command_unsupported');
  }

  const body = command.payload.body.trim();
  if (!body) {
    throw new Error('quick_note_empty');
  }

  await options.addSignal(buildQuickNoteSignal(command, body, options.now ?? new Date()));
}

function buildQuickNoteSignal(command: CompanionCommand, body: string, now: Date): Signal {
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
