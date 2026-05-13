import { loadCompanionBridgeToken } from './companionBridgeToken';

export const companionCommandsPendingUrl = 'http://127.0.0.1:17777/commands/pending';
export const companionCommandAckUrl = (id: string) =>
  `http://127.0.0.1:17777/commands/${encodeURIComponent(id)}/ack`;
export const maxCompanionQuickNoteLength = 500;

export interface CompanionCommand {
  id: string;
  type: 'quick_note';
  createdAt: string;
  payload: {
    body: string;
    currentSystemName?: string;
  };
}

type CommandFetch = (
  url: string,
  init: {
    method: 'GET' | 'POST';
    headers: Record<string, string>;
  },
) => Promise<{ ok: boolean; json?: () => Promise<unknown> }>;

interface CommandRequestOptions {
  fetcher?: CommandFetch;
  token?: string | null;
}

export type PendingCommandResult =
  | { status: 'commands'; commands: CompanionCommand[] }
  | { status: 'unpaired' }
  | { status: 'rejected' }
  | { status: 'disconnected' };

export type CommandAckResult =
  | { status: 'acked' }
  | { status: 'unpaired' }
  | { status: 'rejected' }
  | { status: 'disconnected' };

export async function fetchPendingCompanionCommands(
  options: CommandRequestOptions = {},
): Promise<PendingCommandResult> {
  const fetcher = options.fetcher ?? fetch;
  const token = options.token ?? loadCompanionBridgeToken();
  if (!token) return { status: 'unpaired' };

  try {
    const response = await fetcher(companionCommandsPendingUrl, {
      method: 'GET',
      headers: { 'x-signal-vault-bridge-token': token },
    });

    if (!response.ok || !response.json) return { status: 'rejected' };

    try {
      return {
        status: 'commands',
        commands: parseCompanionCommands(await response.json()),
      };
    } catch {
      return { status: 'rejected' };
    }
  } catch {
    return { status: 'disconnected' };
  }
}

export async function ackCompanionCommand(
  id: string,
  options: CommandRequestOptions = {},
): Promise<CommandAckResult> {
  const fetcher = options.fetcher ?? fetch;
  const token = options.token ?? loadCompanionBridgeToken();
  if (!token) return { status: 'unpaired' };

  try {
    const response = await fetcher(companionCommandAckUrl(id), {
      method: 'POST',
      headers: { 'x-signal-vault-bridge-token': token },
    });

    return response.ok ? { status: 'acked' } : { status: 'rejected' };
  } catch {
    return { status: 'disconnected' };
  }
}

export function parseCompanionCommands(value: unknown): CompanionCommand[] {
  if (!Array.isArray(value) || !value.every(isCompanionCommand)) {
    throw new Error('companion_command_invalid');
  }

  return value;
}

function isCompanionCommand(value: unknown): value is CompanionCommand {
  if (typeof value !== 'object' || value === null) return false;
  const command = value as Record<string, unknown>;
  const payload = command['payload'];
  if (typeof payload !== 'object' || payload === null) return false;
  const payloadRecord = payload as Record<string, unknown>;
  const body = payloadRecord['body'];

  return (
    typeof command['id'] === 'string' &&
    command['type'] === 'quick_note' &&
    typeof command['createdAt'] === 'string' &&
    typeof body === 'string' &&
    body.trim().length > 0 &&
    body.trim().length <= maxCompanionQuickNoteLength &&
    (payloadRecord['currentSystemName'] === undefined ||
      typeof payloadRecord['currentSystemName'] === 'string')
  );
}
