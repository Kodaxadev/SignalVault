import { describe, it, expect } from 'vitest';
import { getActionsForType, getActionById } from './quickActions';

describe('quickActions', () => {
  it('getActionsForType returns correct actions per entity type', () => {
    const gateActions = getActionsForType('smart_gate');
    expect(gateActions).toHaveLength(4);
    expect(gateActions.map((a) => a.id)).toContain('passed');
    expect(gateActions.map((a) => a.id)).toContain('blocked');
  });

  it('unknown type has field_note action', () => {
    const actions = getActionsForType('unknown');
    expect(actions).toHaveLength(1);
    expect(actions[0]?.id).toBe('field_note');
  });

  it('smart_turret has no actions yet', () => {
    expect(getActionsForType('smart_turret')).toHaveLength(0);
  });

  it('getActionById returns correct action', () => {
    const action = getActionById('passed');
    expect(action?.signalType).toBe('gate_recon');
  });
});
