import type { ResolvedEntity } from '@/features/entities';
import type { Signal } from '@/features/signals/signalTypes';
import { hasSignalOfType } from '@/features/dossiers/dossierSignals';
import { evaluateSignalStaleness } from '@/features/staleness/evaluateSignalStaleness';
import { getContradictionsForEntity } from '@/features/contradictions/contradictionRules';

function timeAgo(dateStr: string, now?: number): string {
  const currentTime = now ?? Date.now();
  const diff = currentTime - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// --- Gate status ---
export type GateDossierStatus = {
  risk: 'green' | 'amber' | 'red' | 'black' | 'unknown';
  access: 'open' | 'blocked' | 'permit_suspected' | 'toll_suspected' | 'unknown';
  warningCount: number;
  lastSignalAt?: string;
  staleIntel?: string;
};

export function deriveGateStatus(signals: Signal[], now?: number): GateDossierStatus {
  if (signals.length === 0) {
    return { risk: 'unknown', access: 'unknown', warningCount: 0 };
  }

  const latest = [...signals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let risk: GateDossierStatus['risk'] = 'unknown';
  let access: GateDossierStatus['access'] = 'unknown';
  let warnings = 0;
  let staleIntel: string | undefined;

  for (const s of latest) {
    if (s.signalType === 'access_denied') {
      access = 'blocked';
      risk = 'red';
      warnings++;
    }
    if (s.signalType === 'hostile_contact') {
      risk = 'red';
      warnings++;
    }
    if (s.signalType === 'permit_report') {
      if (access === 'unknown') access = 'permit_suspected';
      if (risk === 'unknown') risk = 'amber';
    }
    if (s.signalType === 'gate_recon' && s.title === 'Passed') {
      if (access === 'unknown') access = 'open';
      if (risk === 'unknown') risk = 'green';
    }
  }

  // Check staleness of latest signal
  const latestSignal = latest[0];
  if (!latestSignal) {
    return { risk, access, warningCount: warnings, lastSignalAt: undefined };
  }
  const staleness = evaluateSignalStaleness(latestSignal, now);
  if (staleness.level === 'stale') {
    staleIntel = `Intel stale — last report ${timeAgo(latestSignal.createdAt, now)}.`;
  } else if (staleness.level === 'critical') {
    staleIntel = `Intel critical — last report ${timeAgo(latestSignal.createdAt, now)} — re-scout recommended.`;
    risk = risk === 'unknown' ? 'amber' : risk;
  }

  return { risk, access, warningCount: warnings, lastSignalAt: latestSignal.createdAt, staleIntel };
}

// --- Storage status ---
export type StorageDossierStatus = {
  access: 'worked' | 'denied' | 'unknown';
  manifest: 'current' | 'stale' | 'empty' | 'unknown';
  staleIntel?: string;
};

export function deriveStorageStatus(signals: Signal[], now?: number): StorageDossierStatus {
  if (signals.length === 0) {
    return { access: 'unknown', manifest: 'unknown' };
  }

  let access: StorageDossierStatus['access'] = 'unknown';
  let manifest: StorageDossierStatus['manifest'] = 'unknown';
  let staleIntel: string | undefined;

  if (hasSignalOfType(signals, 'access_denied')) {
    access = 'denied';
  } else if (hasSignalOfType(signals, 'storage_manifest') || signals.some((s) => s.signalType === 'gate_recon' && s.title === 'Access Worked')) {
    access = 'worked';
  }

  if (signals.some((s) => s.tags.includes('empty'))) {
    manifest = 'empty';
  } else if (hasSignalOfType(signals, 'storage_manifest')) {
    manifest = 'current';
    // Check staleness of latest storage_manifest signal
    const latestManifest = signals
      .filter((s) => s.signalType === 'storage_manifest')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (latestManifest) {
      const staleness = evaluateSignalStaleness(latestManifest, now);
      if (staleness.level === 'stale' || staleness.level === 'critical') {
        manifest = 'stale';
        staleIntel = `Manifest stale — last update ${timeAgo(latestManifest.createdAt, now)}.`;
      }
    }
  }

  return { access, manifest, staleIntel };
}

// --- Market status ---
export type MarketDossierStatus = {
  status: 'open' | 'closed' | 'poor_liquidity' | 'good_trade' | 'hostile' | 'unknown';
  lastSignalAt?: string;
  staleIntel?: string;
};

export function deriveMarketStatus(signals: Signal[], now?: number): MarketDossierStatus {
  if (signals.length === 0) {
    return { status: 'unknown' };
  }

  const latest = [...signals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  const marketSignals = signals.filter((s) => s.signalType === 'market_report');
  if (marketSignals.length === 0) return { status: 'unknown', lastSignalAt: latest?.createdAt };

  const latestMarket = marketSignals[0];
  if (!latestMarket) return { status: 'unknown', lastSignalAt: latest?.createdAt };
  let status: MarketDossierStatus['status'] = 'unknown';
  let staleIntel: string | undefined;

  if (latestMarket.tags.includes('closed')) status = 'closed';
  else if (latestMarket.tags.includes('poor_liquidity')) status = 'poor_liquidity';
  else if (latestMarket.tags.includes('good_trade')) status = 'good_trade';
  else if (latestMarket.tags.includes('hostile')) status = 'hostile';
  else if (latestMarket.tags.includes('open')) status = 'open';

  // Check staleness
  const staleness = evaluateSignalStaleness(latestMarket, now);
  if (staleness.level === 'stale' || staleness.level === 'critical') {
    staleIntel = `Market report stale — last update ${timeAgo(latestMarket.createdAt, now)}.`;
  }

  return { status, lastSignalAt: latest?.createdAt, staleIntel };
}

// --- System status ---
export type SystemDossierStatus = {
  risk: 'green' | 'amber' | 'red' | 'unknown';
  totalSignals: number;
  hostileCount: number;
  resourceCount: number;
};

export function deriveSystemStatus(signals: Signal[]): SystemDossierStatus {
  if (signals.length === 0) {
    return { risk: 'unknown', totalSignals: 0, hostileCount: 0, resourceCount: 0 };
  }

  const hostileCount = signals.filter((s) => s.signalType === 'hostile_contact' || s.signalType === 'system_report').length;
  const resourceCount = signals.filter((s) => s.signalType === 'resource_report').length;
  const risk: SystemDossierStatus['risk'] = hostileCount > 0 ? 'red' : 'green';

  return { risk, totalSignals: signals.length, hostileCount, resourceCount };
}

// --- Route status ---
export type RouteDossierStatus = {
  risk: 'green' | 'amber' | 'red' | 'black' | 'ghost';
  blockedCount: number;
  unsafeCount: number;
};

export function deriveRouteStatus(signals: Signal[]): RouteDossierStatus {
  if (signals.length === 0) {
    return { risk: 'ghost', blockedCount: 0, unsafeCount: 0 };
  }

  const blockedCount = signals.filter((s) => s.tags.includes('blocked')).length;
  const unsafeCount = signals.filter((s) => s.tags.includes('unsafe')).length;
  const risk: RouteDossierStatus['risk'] = unsafeCount > 0 ? 'red' : blockedCount > 0 ? 'amber' : 'green';

  return { risk, blockedCount, unsafeCount };
}

// --- Warnings ---
export type DossierStatus =
  | { type: 'gate'; status: GateDossierStatus }
  | { type: 'storage'; status: StorageDossierStatus }
  | { type: 'market'; status: MarketDossierStatus }
  | { type: 'system'; status: SystemDossierStatus }
  | { type: 'route'; status: RouteDossierStatus }
  | { type: 'unknown' };

export function deriveDossierWarnings(input: {
  entity: ResolvedEntity;
  signals: Signal[];
  status: DossierStatus;
  now?: number;
}): string[] {
  const warnings: string[] = [];

  // Entity resolution warnings
  if (input.entity.confidence === 'conflicted') {
    warnings.push('Classification conflicted — sources disagree.');
  }
  if (input.entity.confidence === 'manual') {
    warnings.push('Manually classified — not yet verified.');
  }

  // No signals warning
  if (input.signals.length === 0) {
    warnings.push('No signals logged yet for this object.');
  }

  // Status-specific warnings
  if (input.status.type === 'gate') {
    if (input.status.status.access === 'blocked') {
      warnings.push('Access blocked — recent denial reports.');
    }
    if (input.status.status.risk === 'red') {
      warnings.push('Hostile activity reported nearby.');
    }
    if (input.status.status.staleIntel) {
      warnings.push(input.status.status.staleIntel);
    }
  }
  if (input.status.type === 'storage') {
    if (input.status.status.staleIntel) {
      warnings.push(input.status.status.staleIntel);
    }
  }
  if (input.status.type === 'market') {
    if (input.status.status.status === 'closed') {
      warnings.push('Market reported as closed.');
    }
    if (input.status.status.staleIntel) {
      warnings.push(input.status.status.staleIntel);
    }
  }
  if (input.status.type === 'route') {
    if (input.status.status.risk === 'red') {
      warnings.push('Route reported as unsafe.');
    }
  }

  // Contradiction warnings
  const entityType = input.entity.type;
  if (entityType && input.signals.length > 0) {
    const contradictions = getContradictionsForEntity(input.signals, input.entity.entityKey, entityType, input.now);
    for (const c of contradictions) {
      warnings.push(`Contradiction: ${c.description}`);
    }
  }

  return warnings;
}
