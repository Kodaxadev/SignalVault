import { describe, it, expect } from 'vitest';
import {
  CHARACTER_TOKEN_CONTRACT_STATUS,
  REQUIRED_CHARACTER_TOKEN_CLAIMS,
  CHARACTER_TOKEN_HARD_INVARIANTS,
  isProductionCharacterTokenAvailable,
  isSuiPlayerProfileResolutionAvailable,
  getProductionIdentityMode,
} from '../src/auth/characterTokenContract';

// vitest.config.ts: AUTH_DEV_MODE=true, ENABLE_SUI_CHARACTER_RESOLUTION not set

describe('characterTokenContract', () => {
  it('CONTRACT_STATUS is blocked_pending_trusted_issuer', () => {
    expect(CHARACTER_TOKEN_CONTRACT_STATUS).toBe('blocked_pending_trusted_issuer');
  });

  it('isProductionCharacterTokenAvailable returns false', () => {
    expect(isProductionCharacterTokenAvailable()).toBe(false);
  });

  it('REQUIRED_CHARACTER_TOKEN_CLAIMS includes sub, iss, aud, exp, iat', () => {
    expect(REQUIRED_CHARACTER_TOKEN_CLAIMS).toContain('sub');
    expect(REQUIRED_CHARACTER_TOKEN_CLAIMS).toContain('iss');
    expect(REQUIRED_CHARACTER_TOKEN_CLAIMS).toContain('aud');
    expect(REQUIRED_CHARACTER_TOKEN_CLAIMS).toContain('exp');
    expect(REQUIRED_CHARACTER_TOKEN_CLAIMS).toContain('iat');
  });

  it('CHARACTER_TOKEN_HARD_INVARIANTS is non-empty', () => {
    expect(CHARACTER_TOKEN_HARD_INVARIANTS.length).toBeGreaterThan(0);
  });

  it('hard invariants include the no-background-sync rule', () => {
    const hasRule = CHARACTER_TOKEN_HARD_INVARIANTS.some((inv) =>
      inv.includes('No background or automatic sync')
    );
    expect(hasRule).toBe(true);
  });
});

describe('isSuiPlayerProfileResolutionAvailable', () => {
  it('returns false when ENABLE_SUI_CHARACTER_RESOLUTION is not set', () => {
    expect(isSuiPlayerProfileResolutionAvailable()).toBe(false);
  });
});

describe('getProductionIdentityMode', () => {
  it('returns dev_character_jwt when AUTH_DEV_MODE=true and Sui is disabled', () => {
    // AUTH_DEV_MODE=true is set by vitest.config.ts; ENABLE_SUI_CHARACTER_RESOLUTION is not set
    expect(getProductionIdentityMode()).toBe('dev_character_jwt');
  });

  it('isProductionCharacterTokenAvailable is false regardless of identity mode', () => {
    // JWT token path is always blocked — Sui resolution is a separate, orthogonal mechanism
    expect(isProductionCharacterTokenAvailable()).toBe(false);
  });
});
