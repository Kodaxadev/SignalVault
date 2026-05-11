import { describe, it, expect } from 'vitest';
import { isRemoteApiErrorCode, type RemoteApiErrorCode } from './remoteApiContracts';

describe('isRemoteApiErrorCode', () => {
  it.each<RemoteApiErrorCode>([
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
  ])('returns true for valid code: %s', (code) => {
    expect(isRemoteApiErrorCode(code)).toBe(true);
  });

  it('returns false for invalid codes', () => {
    expect(isRemoteApiErrorCode('unknown_error')).toBe(false);
    expect(isRemoteApiErrorCode('')).toBe(false);
    expect(isRemoteApiErrorCode('custom_code')).toBe(false);
  });
});
