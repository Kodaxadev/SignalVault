import { describe, it, expect } from 'vitest';
import { buildAuditInsertValues } from '../src/db/auditRepository';
import type { ServerAuditEvent } from '../src/audit/auditTypes';

const baseEvent: ServerAuditEvent = {
  id: 'evt-001',
  eventType: 'signal_created',
  actorWalletAddress: 'wallet-abc',
  actorRoleSnapshot: { role: 'scout' },
  targetSignalId: 'sig-001',
  outcome: 'success',
  requestId: 'req-123',
  metadata: { source: 'test' },
  createdAt: '2026-05-10T12:00:00.000Z',
};

describe('buildAuditInsertValues', () => {
  it('returns exactly 15 values (matching INSERT_SQL placeholders)', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values).toHaveLength(15);
  });

  it('position 0 is event id', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[0]).toBe('evt-001');
  });

  it('position 1 is eventType', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[1]).toBe('signal_created');
  });

  it('position 2 is null when actorCharacterId is absent', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[2]).toBeNull();
  });

  it('position 2 is actorCharacterId when present', () => {
    const values = buildAuditInsertValues({ ...baseEvent, actorCharacterId: 'char-1' });
    expect(values[2]).toBe('char-1');
  });

  it('position 5 serializes actorRoleSnapshot as JSON string', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[5]).toBe(JSON.stringify({ role: 'scout' }));
  });

  it('position 10 is null when denialReason is absent', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[10]).toBeNull();
  });

  it('position 10 is denialReason when present', () => {
    const values = buildAuditInsertValues({
      ...baseEvent,
      outcome: 'denied',
      denialReason: 'tribe_identity_missing',
    });
    expect(values[10]).toBe('tribe_identity_missing');
  });

  it('position 12 serializes metadata as JSON string', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[12]).toBe(JSON.stringify({ source: 'test' }));
  });

  it('position 13 is createdAt', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[13]).toBe('2026-05-10T12:00:00.000Z');
  });

  it('position 14 is null when identitySource is absent', () => {
    const values = buildAuditInsertValues(baseEvent);
    expect(values[14]).toBeNull();
  });

  it('position 14 is identitySource when present', () => {
    const values = buildAuditInsertValues({ ...baseEvent, identitySource: 'sui_player_profile' });
    expect(values[14]).toBe('sui_player_profile');
  });

  it('handles denied event with full actor context', () => {
    const values = buildAuditInsertValues({
      ...baseEvent,
      actorCharacterId: 'char-1',
      actorTribeId: 'tribe-1',
      outcome: 'denied',
      denialReason: 'character_required',
      oldVisibility: 'public',
      newVisibility: 'tribe',
    });
    expect(values[2]).toBe('char-1');
    expect(values[4]).toBe('tribe-1');
    expect(values[7]).toBe('public');
    expect(values[8]).toBe('tribe');
    expect(values[9]).toBe('denied');
    expect(values[10]).toBe('character_required');
  });
});
