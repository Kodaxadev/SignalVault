import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEnv: Record<string, string | undefined> = {
  VITE_REMOTE_DEV_AUTH: undefined,
  VITE_REMOTE_DEV_CHARACTER_JWT: undefined,
  VITE_REMOTE_DEV_WALLET_SIGNATURE: undefined,
  VITE_REMOTE_DEV_WALLET_ADDRESS: undefined,
  VITE_REMOTE_DEV_SIGNATURE_MESSAGE: undefined,
};

vi.mock('@/lib/env', () => ({ env: mockEnv }));

const { getRemoteDevCredentials, isRemoteDevAuthEnabled } = await import('./remoteDevCredentials');

beforeEach(() => {
  mockEnv.VITE_REMOTE_DEV_AUTH = undefined;
  mockEnv.VITE_REMOTE_DEV_CHARACTER_JWT = undefined;
  mockEnv.VITE_REMOTE_DEV_WALLET_SIGNATURE = undefined;
  mockEnv.VITE_REMOTE_DEV_WALLET_ADDRESS = undefined;
  mockEnv.VITE_REMOTE_DEV_SIGNATURE_MESSAGE = undefined;
});

describe('isRemoteDevAuthEnabled', () => {
  it('returns false when flag is not set', () => {
    expect(isRemoteDevAuthEnabled()).toBe(false);
  });

  it('returns false when flag is "false"', () => {
    mockEnv.VITE_REMOTE_DEV_AUTH = 'false';
    expect(isRemoteDevAuthEnabled()).toBe(false);
  });

  it('returns true when flag is "true"', () => {
    mockEnv.VITE_REMOTE_DEV_AUTH = 'true';
    expect(isRemoteDevAuthEnabled()).toBe(true);
  });
});

describe('getRemoteDevCredentials', () => {
  it('returns null when dev auth is not enabled', () => {
    expect(getRemoteDevCredentials()).toBeNull();
  });

  it('returns null when flag is true but JWT is missing', () => {
    mockEnv.VITE_REMOTE_DEV_AUTH = 'true';
    mockEnv.VITE_REMOTE_DEV_WALLET_SIGNATURE = 'sig';
    expect(getRemoteDevCredentials()).toBeNull();
  });

  it('returns null when flag is true but wallet signature is missing', () => {
    mockEnv.VITE_REMOTE_DEV_AUTH = 'true';
    mockEnv.VITE_REMOTE_DEV_CHARACTER_JWT = 'eyJ.pay.sig';
    expect(getRemoteDevCredentials()).toBeNull();
  });

  it('returns credentials when all required vars are set', () => {
    mockEnv.VITE_REMOTE_DEV_AUTH = 'true';
    mockEnv.VITE_REMOTE_DEV_CHARACTER_JWT = 'eyJ.pay.sig';
    mockEnv.VITE_REMOTE_DEV_WALLET_SIGNATURE = 'wallet-sig';
    mockEnv.VITE_REMOTE_DEV_SIGNATURE_MESSAGE = 'signal-vault:abc';

    const result = getRemoteDevCredentials();
    expect(result).not.toBeNull();
    expect(result?.characterJwt).toBe('eyJ.pay.sig');
    expect(result?.walletSignature).toBe('wallet-sig');
    expect(result?.signatureMessage).toBe('signal-vault:abc');
  });

  it('uses default signatureMessage when not set', () => {
    mockEnv.VITE_REMOTE_DEV_AUTH = 'true';
    mockEnv.VITE_REMOTE_DEV_CHARACTER_JWT = 'eyJ.pay.sig';
    mockEnv.VITE_REMOTE_DEV_WALLET_SIGNATURE = 'wallet-sig';

    const result = getRemoteDevCredentials();
    expect(result?.signatureMessage).toBe('signal-vault:dev');
  });
});
