import { describe, it, expect } from 'vitest';
import {
  extractCharacterId,
  extractCharacterName,
  extractCharacterObjectId,
  extractTribeId,
  extractTribeName,
  extractWalletFromCharacter,
} from '@/features/frontier/character/frontierCharacterExtractors';

describe('frontierCharacterExtractors', () => {
  describe('extractCharacterId', () => {
    it('extracts characterId from record', () => {
      expect(extractCharacterId({ characterId: 'char-001' })).toBe('char-001');
    });

    it('falls back to id', () => {
      expect(extractCharacterId({ id: 'char-002' })).toBe('char-002');
    });

    it('returns undefined for non-record', () => {
      expect(extractCharacterId(null)).toBeUndefined();
      expect(extractCharacterId('string')).toBeUndefined();
      expect(extractCharacterId(123)).toBeUndefined();
    });

    it('returns undefined when no matching key', () => {
      expect(extractCharacterId({ foo: 'bar' })).toBeUndefined();
    });
  });

  describe('extractCharacterName', () => {
    it('extracts characterName from record', () => {
      expect(extractCharacterName({ characterName: 'Test Char' })).toBe('Test Char');
    });

    it('falls back to name', () => {
      expect(extractCharacterName({ name: 'Test Char 2' })).toBe('Test Char 2');
    });

    it('returns undefined for non-string values', () => {
      expect(extractCharacterName({ characterName: 123 })).toBeUndefined();
    });
  });

  describe('extractCharacterObjectId', () => {
    it('extracts characterObjectId from record', () => {
      expect(extractCharacterObjectId({ characterObjectId: 'obj-001' })).toBe('obj-001');
    });

    it('falls back to objectId', () => {
      expect(extractCharacterObjectId({ objectId: 'obj-002' })).toBe('obj-002');
    });
  });

  describe('extractTribeId', () => {
    it('extracts tribeId from record', () => {
      expect(extractTribeId({ tribeId: 'tribe-001' })).toBe('tribe-001');
    });

    it('falls back to tribe', () => {
      expect(extractTribeId({ tribe: 'tribe-002' })).toBe('tribe-002');
    });
  });

  describe('extractTribeName', () => {
    it('extracts tribeName from record', () => {
      expect(extractTribeName({ tribeName: 'Test Tribe' })).toBe('Test Tribe');
    });
  });

  describe('extractWalletFromCharacter', () => {
    it('extracts walletAddress from record', () => {
      expect(extractWalletFromCharacter({ walletAddress: '0xabc' })).toBe('0xabc');
    });

    it('falls back to wallet', () => {
      expect(extractWalletFromCharacter({ wallet: '0xdef' })).toBe('0xdef');
    });

    it('falls back to address', () => {
      expect(extractWalletFromCharacter({ address: '0xghi' })).toBe('0xghi');
    });

    it('returns undefined for non-string values', () => {
      expect(extractWalletFromCharacter({ walletAddress: 123 })).toBeUndefined();
    });
  });
});
