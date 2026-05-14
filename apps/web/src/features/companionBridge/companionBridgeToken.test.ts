import { describe, expect, it } from 'vitest';
import {
  companionBridgeTokenStorageKey,
  loadCompanionBridgeToken,
} from './companionBridgeToken';

describe('companionBridgeToken', () => {
  it('loads a configured token from local storage', () => {
    localStorage.setItem(companionBridgeTokenStorageKey, 'token-123');

    expect(loadCompanionBridgeToken()).toBe('token-123');
  });

  it('returns null when no token is configured', () => {
    localStorage.removeItem(companionBridgeTokenStorageKey);

    expect(loadCompanionBridgeToken()).toBeNull();
  });
});
