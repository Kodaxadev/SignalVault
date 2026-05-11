import { describe, it, expect } from 'vitest';
import { extractSmartObjectId, extractSmartObjectType, extractSmartObjectName } from './smartObjectExtractors';

describe('extractSmartObjectId', () => {
  it('returns undefined for non-object values', () => {
    expect(extractSmartObjectId(null)).toBeUndefined();
    expect(extractSmartObjectId(undefined)).toBeUndefined();
    expect(extractSmartObjectId(42)).toBeUndefined();
    expect(extractSmartObjectId('string')).toBeUndefined();
    expect(extractSmartObjectId(true)).toBeUndefined();
  });

  it('returns id when it is a string', () => {
    expect(extractSmartObjectId({ id: 'abc-123' })).toBe('abc-123');
  });

  it('returns undefined when id is not a string', () => {
    expect(extractSmartObjectId({ id: 123 })).toBeUndefined();
    expect(extractSmartObjectId({ id: null })).toBeUndefined();
    expect(extractSmartObjectId({ id: undefined })).toBeUndefined();
  });

  it('returns undefined when id is missing', () => {
    expect(extractSmartObjectId({ name: 'foo' })).toBeUndefined();
  });
});

describe('extractSmartObjectType', () => {
  it('returns undefined for non-object values', () => {
    expect(extractSmartObjectType(null)).toBeUndefined();
    expect(extractSmartObjectType(42)).toBeUndefined();
  });

  it('returns type when it is a string', () => {
    expect(extractSmartObjectType({ type: 'SmartGate' })).toBe('SmartGate');
  });

  it('returns undefined when type is not a string', () => {
    expect(extractSmartObjectType({ type: 123 })).toBeUndefined();
  });
});

describe('extractSmartObjectName', () => {
  it('returns undefined for non-object values', () => {
    expect(extractSmartObjectName(null)).toBeUndefined();
  });

  it('returns name when it is a string', () => {
    expect(extractSmartObjectName({ name: 'My Gate' })).toBe('My Gate');
  });

  it('returns undefined when name is not a string', () => {
    expect(extractSmartObjectName({ name: {} })).toBeUndefined();
  });
});
