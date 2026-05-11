import { describe, it, expect } from 'vitest';
import { buildRemoteAuthHeaders } from './remoteAuthHeaders';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { RemoteCredentials } from './remoteAuthHeaders';

const anon: ViewerContext = { state: 'anonymous', roles: [] };
const walletConnected: ViewerContext = {
  state: 'wallet_connected',
  walletAddress: '0xabc',
  roles: [],
};
const characterResolved: ViewerContext = {
  state: 'character_resolved',
  walletAddress: '0xabc',
  characterId: 'char-1',
  tribeId: 'tribe-1',
  roles: ['member'],
};

const validCreds: RemoteCredentials = {
  characterJwt: 'eyJ.payload.sig',
  walletSignature: 'wallet-sig-bytes',
  signatureMessage: 'signal-vault:abc123',
};

describe('buildRemoteAuthHeaders', () => {
  it('blocks anonymous viewer', () => {
    const result = buildRemoteAuthHeaders(anon);
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('viewer_not_authenticated');
  });

  it('blocks wallet_connected viewer (no character JWT)', () => {
    const result = buildRemoteAuthHeaders(walletConnected);
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('character_token_unavailable');
  });

  it('blocks character_resolved viewer with no credentials', () => {
    const result = buildRemoteAuthHeaders(characterResolved);
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('wallet_signature_unavailable');
  });

  it('returns ready with full headers when credentials are present', () => {
    const result = buildRemoteAuthHeaders(characterResolved, validCreds);
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.headers['Authorization']).toBe('Bearer eyJ.payload.sig');
      expect(result.headers['X-Wallet-Signature']).toBe('wallet-sig-bytes');
      expect(result.headers['X-Signature-Message']).toBe('signal-vault:abc123');
      expect(result.headers['X-Wallet-Address']).toBe('0xabc');
    }
  });

  it('omits X-Wallet-Address when viewer has no walletAddress', () => {
    const noWallet: ViewerContext = {
      state: 'character_resolved',
      characterId: 'char-1',
      roles: [],
    };
    const result = buildRemoteAuthHeaders(noWallet, validCreds);
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect('X-Wallet-Address' in result.headers).toBe(false);
    }
  });

  it('blocks when characterJwt is empty', () => {
    const result = buildRemoteAuthHeaders(characterResolved, {
      ...validCreds,
      characterJwt: '',
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('character_token_unavailable');
  });

  it('blocks when walletSignature is empty', () => {
    const result = buildRemoteAuthHeaders(characterResolved, {
      ...validCreds,
      walletSignature: '',
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('wallet_signature_unavailable');
  });
});
