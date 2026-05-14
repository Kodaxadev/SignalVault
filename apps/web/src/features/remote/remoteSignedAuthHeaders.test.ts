import { describe, it, expect } from 'vitest';
import { buildSignedAuthHeaders } from './remoteSignedAuthHeaders';

describe('buildSignedAuthHeaders', () => {
  const input = {
    challengeId: 'uuid-challenge-1',
    signature: 'wallet-sig-bytes',
    walletAddress: '0xabc',
  };

  it('does not set Authorization header for signed wallet auth', () => {
    const headers = buildSignedAuthHeaders(input);
    expect('Authorization' in headers).toBe(false);
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
