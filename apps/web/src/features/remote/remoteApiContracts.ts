import type { CreateRemoteSignalPayload, RemoteSignal, RemoteSignalVisibility } from './remoteSignalTypes';
import type { AuditEvent } from './remoteAuditTypes';

// Auth is supplied via HTTP headers (Phase 09G+):
//   Authorization: Bearer <characterJwt>
//   X-Wallet-Signature: <walletSignature>
//   X-Signature-Message: <signedMessage>
//   X-Wallet-Address: <walletAddress>  (hint only; server derives authoritative address)
//
// The request body carries only the signal payload — no auth fields.

export type RemoteApiErrorCode =
  | 'auth_missing'
  | 'wallet_signature_invalid'
  | 'character_token_invalid'
  | 'tribe_identity_missing'
  | 'tribe_mismatch'
  | 'scope_not_allowed'
  | 'signal_not_found'
  | 'visibility_not_allowed'
  | 'rate_limited'
  | 'validation_failed'
  | 'server_error';

export interface RemoteApiError {
  code: RemoteApiErrorCode;
  message: string;
  requestId?: string;
}

export function isRemoteApiErrorCode(code: string): code is RemoteApiErrorCode {
  const validCodes: RemoteApiErrorCode[] = [
    'auth_missing',
    'wallet_signature_invalid',
    'character_token_invalid',
    'tribe_identity_missing',
    'tribe_mismatch',
    'scope_not_allowed',
    'signal_not_found',
    'visibility_not_allowed',
    'rate_limited',
    'validation_failed',
    'server_error',
  ];
  return validCodes.includes(code as RemoteApiErrorCode);
}

// Body: signal payload only. Auth is in headers.
export interface CreateSignalRequest {
  signal: CreateRemoteSignalPayload;
}

export interface CreateSignalResponse {
  signalId: string;
  requestId: string;
}

export interface ListSignalsRequest {
  tribeId?: string;
  visibility?: RemoteSignalVisibility[];
  entityKey?: string;
  limit?: number;
  cursor?: string;
}

export interface ListSignalsResponse {
  signals: RemoteSignal[];
  nextCursor?: string;
}

export interface GetSignalRequest {
  signalId: string;
}

export interface GetSignalResponse {
  signal: RemoteSignal;
}

// Body: update fields only. Auth is in headers.
export interface UpdateSignalRequest {
  signalId: string;
  updates: {
    title?: string;
    body?: string;
    confidence?: string;
    visibility?: RemoteSignalVisibility;
  };
}

export interface UpdateSignalResponse {
  signal: RemoteSignal;
  auditEvent: AuditEvent;
}

// Auth is in headers.
export interface DeleteSignalRequest {
  signalId: string;
}

export interface DeleteSignalResponse {
  auditEvent: AuditEvent;
}

// Auth is in headers.
export interface ExportSignalRequest {
  signalId: string;
  format: 'json' | 'csv';
}

export interface ExportSignalResponse {
  exportUrl: string;
  auditEvent: AuditEvent;
}
