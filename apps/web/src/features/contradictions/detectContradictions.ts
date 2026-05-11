import type { Signal, SignalType } from '@/features/signals/signalTypes';
import type { EntityType } from '@/features/entities';
import type { Contradiction, ContradictionSeverity, ContradictionType } from './contradictionTypes';
import { STALENESS_RULES } from '@/features/staleness/stalenessRules';

export const CONTRADICTION_WINDOW_MS: Record<string, number> = {
  smart_gate: 72 * 60 * 60 * 1000,       // 72h
  smart_storage_unit: 168 * 60 * 60 * 1000, // 168h (7d)
  market: 72 * 60 * 60 * 1000,           // 72h
  route: 72 * 60 * 60 * 1000,            // 72h
  system: 168 * 60 * 60 * 1000,          // 168h (7d)
};

function hasSignalType(signals: Signal[], type: SignalType): Signal[] {
  return signals.filter((s) => s.signalType === type);
}

function hasTag(signals: Signal[], tag: string): Signal[] {
  return signals.filter((s) => s.tags.includes(tag));
}

function isWithinWindow(signal: Signal, now: number, windowMs: number): boolean {
  const ts = Math.max(new Date(signal.createdAt).getTime(), new Date(signal.updatedAt).getTime());
  return now - ts <= windowMs;
}

function severityForPair(a: Signal, b: Signal): ContradictionSeverity {
  // If both signals are fresh, contradiction is critical
  const aRule = STALENESS_RULES[a.signalType];
  const bRule = STALENESS_RULES[b.signalType];
  if (!aRule || !bRule) return 'warning';
  const now = Date.now();
  const aAge = now - Math.max(new Date(a.createdAt).getTime(), new Date(a.updatedAt).getTime());
  const bAge = now - Math.max(new Date(b.createdAt).getTime(), new Date(b.updatedAt).getTime());
  if (aAge <= aRule.freshForMs && bAge <= bRule.freshForMs) return 'critical';
  return 'warning';
}

function pair(a: Signal, b: Signal, type: ContradictionType, desc: string): Contradiction {
  // signalA = more recent, signalB = older
  const aTime = Math.max(new Date(a.createdAt).getTime(), new Date(a.updatedAt).getTime());
  const bTime = Math.max(new Date(b.createdAt).getTime(), new Date(b.updatedAt).getTime());
  return {
    type,
    severity: severityForPair(a, b),
    signalA: aTime >= bTime ? a : b,
    signalB: aTime >= bTime ? b : a,
    description: desc,
  };
}

/**
 * Detect contradictions within a single entity's signals.
 * Uses signalType and tags only — never title/body text.
 * Only compares signals within the contradiction window.
 */
export function detectContradictions(signals: Signal[], entityType: EntityType, now?: number): Contradiction[] {
  const currentTime = now ?? Date.now();
  const windowMs = CONTRADICTION_WINDOW_MS[entityType] ?? 72 * 60 * 60 * 1000;
  const inWindow = signals.filter((s) => isWithinWindow(s, currentTime, windowMs));
  const results: Contradiction[] = [];

  // Gate: gate_recon + "passed" tag vs access_denied
  const gatePassed = hasTag(hasSignalType(inWindow, 'gate_recon'), 'passed');
  const accessDenied = hasSignalType(inWindow, 'access_denied');
  for (const a of gatePassed) {
    for (const b of accessDenied) {
      results.push(pair(a, b, 'gate_passed_vs_blocked', 'Gate reported as passed, but access denied report exists.'));
    }
  }

  // Gate: gate_recon + "passed" tag vs gate_recon + "permit" tag
  const gatePermit = hasTag(hasSignalType(inWindow, 'gate_recon'), 'permit');
  for (const a of gatePassed) {
    for (const b of gatePermit) {
      results.push(pair(a, b, 'gate_passed_vs_permit', 'Gate reported as passed, but permit required report exists.'));
    }
  }

  // Storage: storage_manifest + "access_worked" tag vs access_denied
  const storageWorked = hasTag(hasSignalType(inWindow, 'storage_manifest'), 'access_worked');
  const storageDenied = hasSignalType(inWindow, 'access_denied');
  for (const a of storageWorked) {
    for (const b of storageDenied) {
      results.push(pair(a, b, 'storage_access_worked_vs_denied', 'Storage access worked, but access denied report exists.'));
    }
  }

  // Storage: storage_manifest + "empty" tag vs storage_manifest without "empty" tag (manifest current)
  const storageEmpty = hasTag(hasSignalType(inWindow, 'storage_manifest'), 'empty');
  const storageHasManifest = hasSignalType(inWindow, 'storage_manifest').filter((s) => !s.tags.includes('empty'));
  for (const a of storageEmpty) {
    for (const b of storageHasManifest) {
      results.push(pair(a, b, 'storage_empty_vs_manifest', 'Storage marked empty, but manifest report exists.'));
    }
  }

  // Market: market_report + "open" tag vs market_report + "closed" tag
  const marketOpen = hasTag(hasSignalType(inWindow, 'market_report'), 'open');
  const marketClosed = hasTag(hasSignalType(inWindow, 'market_report'), 'closed');
  for (const a of marketOpen) {
    for (const b of marketClosed) {
      results.push(pair(a, b, 'market_open_vs_closed', 'Market reported as open, but closed report exists.'));
    }
  }

  // Market: market_report + "open" tag vs market_report + "hostile" tag
  const marketHostile = hasTag(hasSignalType(inWindow, 'market_report'), 'hostile');
  for (const a of marketOpen) {
    for (const b of marketHostile) {
      results.push(pair(a, b, 'market_open_vs_hostile', 'Market reported as open, but hostile report exists.'));
    }
  }

  // Route: route_report + "safe" tag vs route_report + "unsafe" tag
  const routeSafe = hasTag(hasSignalType(inWindow, 'route_report'), 'safe');
  const routeUnsafe = hasTag(hasSignalType(inWindow, 'route_report'), 'unsafe');
  for (const a of routeSafe) {
    for (const b of routeUnsafe) {
      results.push(pair(a, b, 'route_safe_vs_unsafe', 'Route reported as safe, but unsafe report exists.'));
    }
  }

  // Route: route_report + "blocked" tag vs route_report + "safe" tag
  const routeBlocked = hasTag(hasSignalType(inWindow, 'route_report'), 'blocked');
  for (const a of routeBlocked) {
    for (const b of routeSafe) {
      results.push(pair(a, b, 'route_blocked_vs_safe', 'Route reported as blocked, but safe report exists.'));
    }
  }

  return results;
}
