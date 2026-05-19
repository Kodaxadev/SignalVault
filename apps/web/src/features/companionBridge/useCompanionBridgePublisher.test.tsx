import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RouteWarning } from '@/features/routes';
import type { Signal } from '@/features/signals';
import type { CurrentSystem } from '@/features/worldContext';
import { useCompanionBridgePublisher } from './useCompanionBridgePublisher';

const currentSystem: CurrentSystem = {
  systemId: '30000142',
  systemName: 'OQQ-0R8',
  source: 'manual',
  setAt: '2026-05-12T12:00:00.000Z',
};

const warning: RouteWarning = {
  systemId: '30000142',
  systemName: 'OQQ-0R8',
  level: 'critical',
  signalType: 'hostile_contact',
  signalCount: 1,
  latestSignalAt: '2026-05-12T12:01:00.000Z',
  stalenessLevel: 'fresh',
  isStale: false,
};

const signal: Signal = {
  id: 'sig-1',
  title: 'Hostile contact',
  body: '',
  signalType: 'hostile_contact',
  confidence: 'verified',
  visibility: 'local_private',
  syncState: 'local_only',
  author: { kind: 'anonymous_local' },
  linkedEntities: [],
  createdInContext: {
    surface: 'external_app',
    viewerState: 'local',
  },
  createdAt: '2026-05-12T12:01:00.000Z',
  updatedAt: '2026-05-12T12:01:00.000Z',
  tags: [],
};

describe('useCompanionBridgePublisher', () => {
  it('publishes normalized read-only state when enabled', async () => {
    const publish = vi.fn().mockResolvedValue({ status: 'published' });

    renderHook(() =>
      useCompanionBridgePublisher({
        currentSystem,
        currentSystemStaticIntel: {
          siteCount: 9,
          beltGroups: 3,
          trojanGroups: 2,
          dangerTaggedGroups: 5,
          tags: ['non_zero_danger_level'],
        },
        warnings: [warning],
        signals: [signal],
        publish,
      }),
    );

    await waitFor(() => expect(publish).toHaveBeenCalledTimes(1));
    expect(publish.mock.calls[0]?.[0]).toMatchObject({
      app: 'signal-vault',
      schemaVersion: 1,
      currentSystem: { name: 'OQQ-0R8' },
      currentSystemStaticIntel: { siteCount: 9 },
      warnings: [{ level: 'critical' }],
      latestSignals: [{ id: 'sig-1' }],
    });
  });

  it('does not publish when disabled', () => {
    const publish = vi.fn();

    renderHook(() =>
      useCompanionBridgePublisher({
        currentSystem,
        warnings: [warning],
        signals: [signal],
        enabled: false,
        publish,
      }),
    );

    expect(publish).not.toHaveBeenCalled();
  });
});
