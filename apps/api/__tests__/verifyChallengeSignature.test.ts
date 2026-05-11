import { describe, it, expect } from 'vitest';
import { verifyChallengeSignature } from '../src/auth/verifyChallengeSignature';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';

// AUTH_DEV_MODE=true is set globally in vitest.config.ts

const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);

describe('verifyChallengeSignature (dev mode)', () => {
  it('returns ok with verifiedAddress when signature is valid', async () => {
    const result = await verifyChallengeSignature('challenge message', VALID_SIG, '0xabc');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.verifiedAddress).toBe('0xabc');
  });

  it('returns signature_malformed when signature is too short', async () => {
    const result = await verifyChallengeSignature('challenge message', 'short', '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('signature_malformed');
  });

  it('returns signature_malformed when signature is empty', async () => {
    const result = await verifyChallengeSignature('challenge message', '', '0xabc');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('signature_malformed');
  });

  it('uses walletAddressHint as derivedAddress in dev mode', async () => {
    const result = await verifyChallengeSignature('msg', VALID_SIG, '0xspecific-address');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.verifiedAddress).toBe('0xspecific-address');
  });
});
