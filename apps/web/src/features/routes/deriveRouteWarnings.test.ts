import { describe, it, expect } from 'vitest';
import { deriveRouteWarnings } from './deriveRouteWarnings';
import type { Signal } from '@/features/signals/signalTypes';

const SYSTEM_A = '30000001';
const SYSTEM_B = '30000002';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  // Use a recent timestamp so staleness rules don't downgrade levels unexpectedly
  const createdAt = overrides.createdAt ?? new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30m ago
  return {
    id: `sig-${Math.random()}`,
    title: 'Test',
    body: '',
    signalType: 'gate_recon',
    confidence: 'observed',
    visibility: 'tribe',
    syncState: 'local_only',
    author: { kind: 'anonymous_local' },
    linkedEntities: [],
    tags: [],
    createdInContext: { surface: 'external_app', viewerState: 'unknown' },
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

function linkedToSystem(systemId: string): Signal['linkedEntities'] {
  return [{ entityId: systemId, type: 'system', label: systemId, resolutionConfidence: 'manual' }];
}

describe('deriveRouteWarnings', () => {
  it('returns empty array when systemIds is empty', () => {
    const signals = [makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) })];
    expect(deriveRouteWarnings(signals, [])).toEqual([]);
  });

  it('returns empty array when no signals match any system', () => {
    const signals = [makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem('99999999') })];
    expect(deriveRouteWarnings(signals, [SYSTEM_A])).toEqual([]);
  });

  it('returns empty array when no signals are warning types', () => {
    const signals = [makeSignal({ signalType: 'field_note', linkedEntities: linkedToSystem(SYSTEM_A) })];
    expect(deriveRouteWarnings(signals, [SYSTEM_A])).toEqual([]);
  });

  it('detects hostile_contact as critical', () => {
    const signals = [
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.level).toBe('critical');
    expect(warnings[0]?.signalType).toBe('hostile_contact');
  });

  it('detects access_denied as high', () => {
    const signals = [makeSignal({ signalType: 'access_denied', linkedEntities: linkedToSystem(SYSTEM_A) })];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings[0]?.level).toBe('high');
  });

  it('detects route_report as medium', () => {
    const signals = [makeSignal({ signalType: 'route_report', linkedEntities: linkedToSystem(SYSTEM_A) })];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings[0]?.level).toBe('medium');
  });

  it('detects gate_recon as info', () => {
    const signals = [makeSignal({ signalType: 'gate_recon', linkedEntities: linkedToSystem(SYSTEM_A) })];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings[0]?.level).toBe('info');
  });

  it('matches signals linked via itemId', () => {
    const signals = [
      makeSignal({
        signalType: 'hostile_contact',
        linkedEntities: [{ entityId: 'other', itemId: SYSTEM_A, type: 'system', label: SYSTEM_A, resolutionConfidence: 'manual' }],
      }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings).toHaveLength(1);
  });

  it('counts multiple signals of the same type for the same system', () => {
    const signals = [
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.signalCount).toBe(3);
  });

  it('produces separate warnings for different systems', () => {
    const signals = [
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_B) }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A, SYSTEM_B]);
    expect(warnings).toHaveLength(2);
  });

  it('produces separate warnings for different signal types in the same system', () => {
    const signals = [
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
      makeSignal({ signalType: 'access_denied', linkedEntities: linkedToSystem(SYSTEM_A) }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings).toHaveLength(2);
  });

  it('sorts warnings by level — critical before high before medium', () => {
    const signals = [
      makeSignal({ signalType: 'route_report', linkedEntities: linkedToSystem(SYSTEM_A) }),
      makeSignal({ signalType: 'access_denied', linkedEntities: linkedToSystem(SYSTEM_A) }),
      makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings.map((w) => w.level)).toEqual(['critical', 'high', 'medium']);
  });

  it('downgrades critical-staleness hostile_contact from critical to high', () => {
    // 200 days ago — well past hostile_contact critical threshold (24h)
    const veryOldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
    const signals = [
      makeSignal({
        signalType: 'hostile_contact',
        linkedEntities: linkedToSystem(SYSTEM_A),
        createdAt: veryOldDate,
        updatedAt: veryOldDate,
      }),
    ];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings[0]?.level).toBe('high');
    expect(warnings[0]?.isStale).toBe(true);
  });

  it('populates systemName from the provided map', () => {
    const signals = [makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) })];
    const names = new Map([[SYSTEM_A, 'A 2560']]);
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A], names);
    expect(warnings[0]?.systemName).toBe('A 2560');
  });

  it('leaves systemName undefined when not in map', () => {
    const signals = [makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) })];
    const warnings = deriveRouteWarnings(signals, [SYSTEM_A]);
    expect(warnings[0]?.systemName).toBeUndefined();
  });

  it('attaches static route intel as advisory context only', () => {
    const signals = [makeSignal({ signalType: 'hostile_contact', linkedEntities: linkedToSystem(SYSTEM_A) })];
    const staticIntel = new Map([
      [SYSTEM_A, {
        siteCount: 9,
        beltGroups: 3,
        trojanGroups: 2,
        dangerTaggedGroups: 5,
        tags: ['belt', 'trojan', 'non_zero_danger_level'],
      }],
    ]);

    const warnings = deriveRouteWarnings(signals, [SYSTEM_A], undefined, staticIntel);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.level).toBe('critical');
    expect(warnings[0]?.staticIntel).toMatchObject({
      siteCount: 9,
      beltGroups: 3,
      trojanGroups: 2,
      dangerTaggedGroups: 5,
    });
  });

  it('does not create route warnings from static intel alone', () => {
    const staticIntel = new Map([
      [SYSTEM_A, {
        siteCount: 9,
        beltGroups: 3,
        trojanGroups: 2,
        dangerTaggedGroups: 5,
        tags: ['non_zero_danger_level'],
      }],
    ]);

    expect(deriveRouteWarnings([], [SYSTEM_A], undefined, staticIntel)).toEqual([]);
  });
});
