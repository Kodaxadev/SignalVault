import { describe, it, expect } from 'vitest';
import {
  deriveGateStatus,
  deriveStorageStatus,
  deriveMarketStatus,
  deriveSystemStatus,
  deriveRouteStatus,
  deriveDossierWarnings,
} from './dossierStatus';
import type { Signal } from '@/features/signals/signalTypes';
import type { ResolvedEntity } from '@/features/entities';

const makeSignal = (type: Signal['signalType'], title = '', tags: string[] = [], daysAgo = 0): Signal => ({
  id: `s-${type}-${daysAgo}`,
  title,
  body: '',
  signalType: type,
  confidence: 'observed',
  visibility: 'local_private',
  syncState: 'local_only',
  author: { kind: 'anonymous_local' },
  linkedEntities: [{ entityId: 'item:test:1', type: 'smart_gate', label: 'Test', resolutionConfidence: 'unknown' }],
  createdInContext: { surface: 'ingame_object', viewerState: 'anonymous' },
  tags,
  createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
});

describe('dossierStatus', () => {
  describe('deriveGateStatus', () => {
    it('no signals → unknown', () => {
      const status = deriveGateStatus([]);
      expect(status.risk).toBe('unknown');
      expect(status.access).toBe('unknown');
    });

    it('passed → open/green', () => {
      const status = deriveGateStatus([makeSignal('gate_recon', 'Passed')]);
      expect(status.access).toBe('open');
      expect(status.risk).toBe('green');
    });

    it('blocked/access_denied → blocked/red', () => {
      const status = deriveGateStatus([makeSignal('access_denied', 'Blocked')]);
      expect(status.access).toBe('blocked');
      expect(status.risk).toBe('red');
    });

    it('permit report → permit_suspected/amber', () => {
      const status = deriveGateStatus([makeSignal('permit_report', 'Permit')]);
      expect(status.access).toBe('permit_suspected');
      expect(status.risk).toBe('amber');
    });

    it('hostile → red warning', () => {
      const status = deriveGateStatus([makeSignal('hostile_contact', 'Hostile')]);
      expect(status.risk).toBe('red');
    });
  });

  describe('deriveStorageStatus', () => {
    it('no signals → unknown/unknown', () => {
      const status = deriveStorageStatus([]);
      expect(status.access).toBe('unknown');
      expect(status.manifest).toBe('unknown');
    });

    it('access denied → denied', () => {
      const status = deriveStorageStatus([makeSignal('access_denied', 'Denied')]);
      expect(status.access).toBe('denied');
    });

    it('empty manifest → empty', () => {
      const status = deriveStorageStatus([makeSignal('storage_manifest', 'Empty', ['empty'])]);
      expect(status.manifest).toBe('empty');
    });
  });

  describe('deriveMarketStatus', () => {
    it('no signals → unknown', () => {
      expect(deriveMarketStatus([]).status).toBe('unknown');
    });

    it('market open → open', () => {
      const status = deriveMarketStatus([makeSignal('market_report', 'Open', ['open'])]);
      expect(status.status).toBe('open');
    });

    it('market closed → closed', () => {
      const status = deriveMarketStatus([makeSignal('market_report', 'Closed', ['closed'])]);
      expect(status.status).toBe('closed');
    });
  });

  describe('deriveSystemStatus', () => {
    it('no signals → unknown', () => {
      const status = deriveSystemStatus([]);
      expect(status.risk).toBe('unknown');
      expect(status.totalSignals).toBe(0);
    });

    it('hostile → red', () => {
      const status = deriveSystemStatus([makeSignal('hostile_contact', 'Hostile')]);
      expect(status.risk).toBe('red');
      expect(status.hostileCount).toBe(1);
    });
  });

  describe('deriveRouteStatus', () => {
    it('no signals → ghost', () => {
      const status = deriveRouteStatus([]);
      expect(status.risk).toBe('ghost');
    });

    it('unsafe → red', () => {
      const status = deriveRouteStatus([makeSignal('route_report', 'Unsafe', ['unsafe'])]);
      expect(status.risk).toBe('red');
    });
  });

  describe('deriveDossierWarnings', () => {
    const baseEntity: ResolvedEntity = {
      entityKey: 'item:test:1',
      entityId: 'item:test:1',
      type: 'smart_gate',
      label: 'Test',
      confidence: 'url_hint',
      sources: [],
      sourceClaims: [],
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('no signals → no-signals warning', () => {
      const warnings = deriveDossierWarnings({
        entity: baseEntity,
        signals: [],
        status: { type: 'gate', status: deriveGateStatus([]) },
      });
      expect(warnings.some((w) => w.includes('No signals'))).toBe(true);
    });

    it('manual entity → manual warning', () => {
      const manualEntity: ResolvedEntity = { ...baseEntity, confidence: 'manual' };
      const warnings = deriveDossierWarnings({
        entity: manualEntity,
        signals: [makeSignal('gate_recon', 'Passed')],
        status: { type: 'gate', status: deriveGateStatus([makeSignal('gate_recon', 'Passed')]) },
      });
      expect(warnings.some((w) => w.includes('Manually classified'))).toBe(true);
    });

    it('conflicted entity → conflict warning', () => {
      const conflictedEntity: ResolvedEntity = { ...baseEntity, confidence: 'conflicted' };
      const warnings = deriveDossierWarnings({
        entity: conflictedEntity,
        signals: [makeSignal('gate_recon', 'Passed')],
        status: { type: 'gate', status: deriveGateStatus([makeSignal('gate_recon', 'Passed')]) },
      });
      expect(warnings.some((w) => w.includes('Classification conflicted'))).toBe(true);
    });

    it('access blocked → warning', () => {
      const warnings = deriveDossierWarnings({
        entity: baseEntity,
        signals: [makeSignal('access_denied', 'Blocked')],
        status: { type: 'gate', status: deriveGateStatus([makeSignal('access_denied', 'Blocked')]) },
      });
      expect(warnings.some((w) => w.includes('Access blocked'))).toBe(true);
    });

    it('market closed → warning', () => {
      const warnings = deriveDossierWarnings({
        entity: { ...baseEntity, type: 'market' },
        signals: [makeSignal('market_report', 'Closed', ['closed'])],
        status: { type: 'market', status: deriveMarketStatus([makeSignal('market_report', 'Closed', ['closed'])]) },
      });
      expect(warnings.some((w) => w.includes('closed'))).toBe(true);
    });
  });
});
