import { describe, it, expect } from 'vitest';
import { createSignalRequestSchema, createSignalPayloadSchema } from '../src/signals/signalValidation';

const validPayload = {
  visibility: 'public',
  signalType: 'gate_recon',
  confidence: 'high',
  title: 'Gate Alpha — confirmed open',
  body: 'Passed through without incident at 14:32.',
  linkedEntities: [],
  createdAt: '2026-05-10T12:00:00.000Z',
};

// Auth is now in HTTP headers — request body carries signal only.
const validRequest = {
  signal: validPayload,
};

describe('createSignalPayloadSchema', () => {
  it('accepts a valid payload', () => {
    expect(createSignalPayloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects missing visibility', () => {
    const { visibility: _v, ...rest } = validPayload;
    expect(createSignalPayloadSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects invalid visibility enum value', () => {
    expect(
      createSignalPayloadSchema.safeParse({ ...validPayload, visibility: 'local_private' }).success
    ).toBe(false);
  });

  it('rejects empty title', () => {
    expect(
      createSignalPayloadSchema.safeParse({ ...validPayload, title: '' }).success
    ).toBe(false);
  });

  it('rejects title over 500 chars', () => {
    expect(
      createSignalPayloadSchema.safeParse({ ...validPayload, title: 'x'.repeat(501) }).success
    ).toBe(false);
  });

  it('rejects body over 10 000 chars', () => {
    expect(
      createSignalPayloadSchema.safeParse({ ...validPayload, body: 'x'.repeat(10_001) }).success
    ).toBe(false);
  });

  it('rejects linkedEntities with more than 20 items', () => {
    expect(
      createSignalPayloadSchema.safeParse({
        ...validPayload,
        linkedEntities: Array.from({ length: 21 }, (_, i) => ({ id: i })),
      }).success
    ).toBe(false);
  });

  it('rejects invalid createdAt (not ISO datetime)', () => {
    expect(
      createSignalPayloadSchema.safeParse({ ...validPayload, createdAt: 'not-a-date' }).success
    ).toBe(false);
  });

  it('accepts valid expiresAt', () => {
    expect(
      createSignalPayloadSchema.safeParse({
        ...validPayload,
        expiresAt: '2026-06-10T12:00:00.000Z',
      }).success
    ).toBe(true);
  });

  it('accepts missing expiresAt (optional)', () => {
    expect(createSignalPayloadSchema.safeParse(validPayload).success).toBe(true);
  });
});

describe('createSignalRequestSchema', () => {
  it('accepts a valid request (signal only — auth is in headers)', () => {
    expect(createSignalRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('rejects missing signal', () => {
    expect(createSignalRequestSchema.safeParse({}).success).toBe(false);
  });

  it('rejects when signal is missing required fields', () => {
    expect(
      createSignalRequestSchema.safeParse({ signal: { visibility: 'public' } }).success
    ).toBe(false);
  });
});
