import { describe, it, expect } from 'vitest';
import { insertAuditEvent } from '../src/audit/insertAuditEvent';
import type { AuditEventInput } from '../src/audit/auditTypes';

const baseInput: AuditEventInput = {
  eventType: 'signal_created',
  actorWalletAddress: 'wallet-abc',
  actorRoleSnapshot: {},
  targetSignalId: 'sig-001',
  outcome: 'success',
  requestId: 'req-123',
  metadata: {},
};

describe('insertAuditEvent', () => {
  it('returns an event with a generated id', async () => {
    const event = await insertAuditEvent(baseInput);
    expect(typeof event.id).toBe('string');
    expect(event.id.length).toBeGreaterThan(0);
  });

  it('returns an event with a createdAt ISO string', async () => {
    const event = await insertAuditEvent(baseInput);
    expect(() => new Date(event.createdAt)).not.toThrow();
    expect(new Date(event.createdAt).toISOString()).toBe(event.createdAt);
  });

  it('preserves outcome success', async () => {
    const event = await insertAuditEvent({ ...baseInput, outcome: 'success' });
    expect(event.outcome).toBe('success');
    expect(event.denialReason).toBeUndefined();
  });

  it('preserves outcome denied with denialReason', async () => {
    const event = await insertAuditEvent({
      ...baseInput,
      outcome: 'denied',
      denialReason: 'tribe_identity_missing',
    });
    expect(event.outcome).toBe('denied');
    expect(event.denialReason).toBe('tribe_identity_missing');
  });

  it('generates unique ids per call', async () => {
    const [a, b] = await Promise.all([
      insertAuditEvent(baseInput),
      insertAuditEvent(baseInput),
    ]);
    expect(a.id).not.toBe(b.id);
  });

  it('preserves identitySource when provided', async () => {
    const event = await insertAuditEvent({
      ...baseInput,
      identitySource: 'sui_player_profile',
    });
    expect(event.identitySource).toBe('sui_player_profile');
  });

  it('preserves resolved character snapshot fields', async () => {
    const event = await insertAuditEvent({
      ...baseInput,
      actorCharacterName: 'Kivik',
      identityResolvedAt: '2026-05-12T16:00:00.000Z',
    });

    expect(event.actorCharacterName).toBe('Kivik');
    expect(event.identityResolvedAt).toBe('2026-05-12T16:00:00.000Z');
  });

  it('identitySource is undefined when not provided', async () => {
    const event = await insertAuditEvent(baseInput);
    expect(event.identitySource).toBeUndefined();
  });
});
