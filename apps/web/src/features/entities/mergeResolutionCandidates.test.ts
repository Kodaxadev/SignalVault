import { describe, it, expect } from 'vitest';
import { mergeResolutionCandidates } from './mergeResolutionCandidates';
import { createClaim } from './entityClassificationTypes';

describe('mergeResolutionCandidates', () => {
  it('returns unknown when no claims', () => {
    const result = mergeResolutionCandidates([]);
    expect(result.type).toBe('unknown');
    expect(result.confidence).toBe('unknown');
    expect(result.winningCandidate).toBeNull();
  });

  it('single url_hint claim returns url_hint', () => {
    const claim = createClaim('item:utopia:12345', 'smart_gate', 'url_hint', { tenant: 'utopia', itemId: '12345' });
    const result = mergeResolutionCandidates([claim]);
    expect(result.type).toBe('smart_gate');
    expect(result.confidence).toBe('url_hint');
    expect(result.winningCandidate!.claim?.source).toBe('url_hint');
  });

  it('manual beats url_hint (higher priority)', () => {
    const urlClaim = createClaim('item:utopia:12345', 'item', 'url_hint', {});
    const manualClaim = createClaim('item:utopia:12345', 'smart_gate', 'user_manual', {});
    const result = mergeResolutionCandidates([urlClaim, manualClaim]);
    expect(result.type).toBe('smart_gate');
    expect(result.winningCandidate!.claim?.source).toBe('user_manual');
  });

  it('mock beats manual (higher priority)', () => {
    const manualClaim = createClaim('item:utopia:12345', 'item', 'user_manual', {});
    const mockClaim = createClaim('item:utopia:12345', 'smart_gate', 'mock_registry', {});
    const result = mergeResolutionCandidates([manualClaim, mockClaim]);
    expect(result.type).toBe('smart_gate');
    expect(result.winningCandidate!.claim?.source).toBe('mock_registry');
  });

  it('same-priority conflict returns conflicted', () => {
    const claim1 = createClaim('item:utopia:12345', 'smart_gate', 'url_hint', {});
    const claim2 = createClaim('item:utopia:12345', 'item', 'url_hint', {});
    const result = mergeResolutionCandidates([claim1, claim2]);
    expect(result.type).toBe('unknown');
    expect(result.confidence).toBe('conflicted');
    expect(result.winningCandidate).toBeNull();
    expect(result.conflictingClaims.length).toBeGreaterThan(0);
  });

  it('onchain_verified beats all', () => {
    const mockClaim = createClaim('item:utopia:12345', 'item', 'mock_registry', {});
    const onchainClaim = createClaim('item:utopia:12345', 'smart_gate', 'onchain_verified', {});
    const result = mergeResolutionCandidates([mockClaim, onchainClaim]);
    expect(result.type).toBe('smart_gate');
    expect(result.winningCandidate!.claim?.source).toBe('onchain_verified');
  });
});
