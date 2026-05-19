import { describe, expect, it } from 'vitest';
import { buildCompanionBridgeState } from './buildCompanionBridgeState';
import type { RouteWarning } from '@/features/routes';
import type { Signal } from '@/features/signals';

const makeSignal = (overrides: Partial<Signal>): Signal => ({
  id: 'sig-1',
  title: 'Gate camp',
  body: 'Observed hostile camp.',
  signalType: 'hostile_contact',
  confidence: 'observed',
  visibility: 'tribe',
  syncState: 'local_only',
  author: { kind: 'anonymous_local' },
  linkedEntities: [],
  createdInContext: { surface: 'external_app', viewerState: 'anonymous' },
  tags: [],
  createdAt: '2026-05-12T00:00:00Z',
  updatedAt: '2026-05-12T00:00:00Z',
  ...overrides,
});

const warning: RouteWarning = {
  systemId: '30000142',
  systemName: 'OQQ-0R8',
  level: 'high',
  signalType: 'hostile_contact',
  signalCount: 2,
  latestSignalAt: '2026-05-12T00:00:00Z',
  stalenessLevel: 'fresh',
  isStale: false,
};

describe('buildCompanionBridgeState', () => {
  it('builds the read-only companion bridge contract', () => {
    const state = buildCompanionBridgeState({
      currentSystem: {
        systemId: '30000142',
        systemName: 'OQQ-0R8',
        source: 'world_api',
        setAt: '2026-05-12T00:00:00Z',
      },
      currentSystemStaticIntel: {
        siteCount: 9,
        beltGroups: 3,
        trojanGroups: 2,
        dangerTaggedGroups: 5,
        tags: ['non_zero_danger_level'],
      },
      warnings: [warning],
      signals: [makeSignal({ id: 'sig-1' })],
      generatedAt: '2026-05-12T01:00:00Z',
    });

    expect(state).toMatchObject({
      app: 'signal-vault',
      schemaVersion: 1,
      currentSystem: {
        id: '30000142',
        name: 'OQQ-0R8',
        source: 'world_api',
      },
      currentSystemStaticIntel: {
        siteCount: 9,
        beltGroups: 3,
        trojanGroups: 2,
        dangerTaggedGroups: 5,
      },
    });
    expect(state.warnings[0]).toMatchObject({
      level: 'warning',
      title: 'Hostile Contact',
      systemName: 'OQQ-0R8',
    });
  });

  it('sorts and caps latest signals', () => {
    const state = buildCompanionBridgeState({
      currentSystem: null,
      warnings: [],
      signals: [
        makeSignal({ id: 'old', createdAt: '2026-05-10T00:00:00Z' }),
        makeSignal({ id: 'new', createdAt: '2026-05-12T00:00:00Z' }),
      ],
      latestSignalLimit: 1,
    });

    expect(state.latestSignals).toHaveLength(1);
    expect(state.latestSignals[0]?.id).toBe('new');
  });
});
