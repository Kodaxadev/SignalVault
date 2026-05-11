import { describe, it, expect } from 'vitest';
import { parseAuthHeaders } from '../src/auth/parseAuthHeaders';

function makeHeaders(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe('parseAuthHeaders', () => {
  it('returns all undefined when headers are absent', () => {
    const result = parseAuthHeaders(makeHeaders({}));
    expect(result.authorizationHeader).toBeUndefined();
    expect(result.walletSignature).toBeUndefined();
    expect(result.signatureMessage).toBeUndefined();
    expect(result.walletAddressHint).toBeUndefined();
    expect(result.challengeId).toBeUndefined();
  });

  it('parses Authorization header', () => {
    const result = parseAuthHeaders(makeHeaders({ authorization: 'Bearer test.jwt.token' }));
    expect(result.authorizationHeader).toBe('Bearer test.jwt.token');
  });

  it('parses X-Wallet-Signature header', () => {
    const result = parseAuthHeaders(makeHeaders({ 'x-wallet-signature': 'sig-abc' }));
    expect(result.walletSignature).toBe('sig-abc');
  });

  it('parses X-Signature-Message header', () => {
    const result = parseAuthHeaders(makeHeaders({ 'x-signature-message': 'signal-vault:nonce' }));
    expect(result.signatureMessage).toBe('signal-vault:nonce');
  });

  it('parses X-Wallet-Address header as hint', () => {
    const result = parseAuthHeaders(makeHeaders({ 'x-wallet-address': '0xdeadbeef' }));
    expect(result.walletAddressHint).toBe('0xdeadbeef');
  });

  it('parses all four headers together', () => {
    const result = parseAuthHeaders(
      makeHeaders({
        authorization: 'Bearer eyJ.payload.sig',
        'x-wallet-signature': 'wallet-sig-bytes',
        'x-signature-message': 'signal-vault:abc123',
        'x-wallet-address': '0xfoo',
      })
    );
    expect(result.authorizationHeader).toBe('Bearer eyJ.payload.sig');
    expect(result.walletSignature).toBe('wallet-sig-bytes');
    expect(result.signatureMessage).toBe('signal-vault:abc123');
    expect(result.walletAddressHint).toBe('0xfoo');
  });

  it('parses X-Challenge-Id header', () => {
    const result = parseAuthHeaders(makeHeaders({ 'x-challenge-id': 'uuid-challenge-1' }));
    expect(result.challengeId).toBe('uuid-challenge-1');
  });

  it('is case-insensitive for header names', () => {
    const result = parseAuthHeaders(makeHeaders({ Authorization: 'Bearer token' }));
    expect(result.authorizationHeader).toBe('Bearer token');
  });
});
