import { describe, it, expect } from 'vitest';
import { buildSignedAuthHeaders } from './remoteSignedAuthHeaders';

describe('buildSignedAuthHeaders', () => {
  const input = {
    challengeId: 'uuid-challenge-1',
    signature: 'wallet-sig-bytes',
    walletAddress: '0xabc',
    characterJwt: 'eyJ.payload.sig',
  };

  it('sets Authorization header with Bearer token', () => {
    const headers = buildSignedAuthHeaders(input);
    expect(headers['Authorization']).toBe('Bearer eyJ.payload.sig');
  });

  it('sets X-Wallet-Address', () => {
    const headers = buildSignedAuthHeaders(input);
    expect(headers['X-Wallet-Address']).toBe('0xabc');
  });

  it('sets X-Wallet-Signature', () => {
    const headers = buildSignedAuthHeaders(input);
    expect(headers['X-Wallet-Signature']).toBe('wallet-sig-bytes');
  });

  it('sets X-Challenge-Id', () => {
    const headers = buildSignedAuthHeaders(input);
    expect(headers['X-Challenge-Id']).toBe('uuid-challenge-1');
  });

  it('does not include X-Signature-Message', () => {
    const headers = buildSignedAuthHeaders(input);
    expect('X-Signature-Message' in headers).toBe(false);
  });
});
