import { describe, it, expect } from 'vitest';
import { checkPolicy } from '../src/policy/checkPolicy';
import type { PolicyContext } from '../src/policy/policyTypes';

function ctx(overrides: Partial<PolicyContext>): PolicyContext {
  return {
    walletAddress: 'wallet-abc',
    requestedVisibility: 'public',
    operation: 'create',
    ...overrides,
  };
}

describe('checkPolicy', () => {
  it('allows public create with wallet only', () => {
    const result = checkPolicy(ctx({ requestedVisibility: 'public' }));
    expect(result.allowed).toBe(true);
  });

  it('allows private create with wallet only', () => {
    const result = checkPolicy(ctx({ requestedVisibility: 'private' }));
    expect(result.allowed).toBe(true);
  });

  it('denies tribe create when tribeId is missing', () => {
    const result = checkPolicy(ctx({ requestedVisibility: 'tribe' }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('tribe_identity_missing');
  });

  it('denies tribe create when characterId is missing but tribeId present', () => {
    const result = checkPolicy(
      ctx({ requestedVisibility: 'tribe', tribeId: 'tribe-1' })
    );
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('character_required');
  });

  it('allows tribe create with both tribeId and characterId', () => {
    const result = checkPolicy(
      ctx({ requestedVisibility: 'tribe', tribeId: 'tribe-1', characterId: 'char-1' })
    );
    expect(result.allowed).toBe(true);
  });

  it('denies officer create when tribeId is missing', () => {
    const result = checkPolicy(ctx({ requestedVisibility: 'officer' }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('tribe_identity_missing');
  });

  it('denies officer create when characterId is missing', () => {
    const result = checkPolicy(
      ctx({ requestedVisibility: 'officer', tribeId: 'tribe-1' })
    );
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('character_required');
  });

  it('allows officer create with both tribeId and characterId', () => {
    const result = checkPolicy(
      ctx({ requestedVisibility: 'officer', tribeId: 'tribe-1', characterId: 'char-1' })
    );
    expect(result.allowed).toBe(true);
  });

  it('denies scout_cell create when tribeId is missing', () => {
    const result = checkPolicy(ctx({ requestedVisibility: 'scout_cell' }));
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('tribe_identity_missing');
  });

  it('allows scout_cell create with both tribeId and characterId', () => {
    const result = checkPolicy(
      ctx({ requestedVisibility: 'scout_cell', tribeId: 'tribe-1', characterId: 'char-1' })
    );
    expect(result.allowed).toBe(true);
  });
});
