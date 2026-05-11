import { describe, it, expect } from 'vitest';
import { createAuditEvent } from './remoteAuditTypes';

describe('createAuditEvent', () => {
  it('generates id and createdAt', () => {
    const event = createAuditEvent({
      eventType: 'signal_created',
      actorWalletAddress: '0x123',
      actorRoleSnapshot: { roles: ['officer'] },
      targetSignalId: 'sig-1',
      newVisibility: 'tribe',
      outcome: 'success',
      requestId: 'req-1',
      metadata: {},
    });

    expect(event.id).toBeDefined();
    expect(event.createdAt).toBeDefined();
    expect(event.eventType).toBe('signal_created');
    expect(event.actorWalletAddress).toBe('0x123');
    expect(event.outcome).toBe('success');
  });

  it('includes denial reason for denied outcomes', () => {
    const event = createAuditEvent({
      eventType: 'signal_created',
      actorWalletAddress: '0x123',
      actorRoleSnapshot: {},
      targetSignalId: 'sig-1',
      outcome: 'denied',
      denialReason: 'tribe_missing',
      requestId: 'req-2',
      metadata: {},
    });

    expect(event.outcome).toBe('denied');
    expect(event.denialReason).toBe('tribe_missing');
  });

  it('preserves old and new visibility for visibility_changed', () => {
    const event = createAuditEvent({
      eventType: 'visibility_changed',
      actorWalletAddress: '0x123',
      actorRoleSnapshot: {},
      targetSignalId: 'sig-1',
      oldVisibility: 'local_private',
      newVisibility: 'tribe',
      outcome: 'success',
      requestId: 'req-3',
      metadata: {},
    });

    expect(event.oldVisibility).toBe('local_private');
    expect(event.newVisibility).toBe('tribe');
  });

  it('includes actor character and tribe when available', () => {
    const event = createAuditEvent({
      eventType: 'signal_updated',
      actorCharacterId: 'char-1',
      actorWalletAddress: '0x123',
      actorTribeId: 'tribe-1',
      actorRoleSnapshot: { roles: ['officer'] },
      targetSignalId: 'sig-1',
      outcome: 'success',
      requestId: 'req-4',
      metadata: {},
    });

    expect(event.actorCharacterId).toBe('char-1');
    expect(event.actorTribeId).toBe('tribe-1');
  });
});
