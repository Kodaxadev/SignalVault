import type { Signal } from '@/features/signals/signalTypes';
import { SignalConfidenceBadge } from './SignalConfidenceBadge';
import { SignalVisibilityBadge } from './SignalVisibilityBadge';
import { SignalSyncBadge } from './SignalSyncBadge';
import { TribeSignalScopeBadge } from '@/features/tribeVault/components/TribeSignalScopeBadge';
import { evaluateSignalStaleness } from '@/features/staleness/evaluateSignalStaleness';
import { RemoteSyncButton } from '@/features/remote/components/RemoteSyncButton';
import { RemoteSyncStatusBadge } from '@/features/remote/components/RemoteSyncStatusBadge';
import { RemoteSyncExplainer } from '@/features/remote/components/RemoteSyncExplainer';

const typeLabels: Record<Signal['signalType'], string> = {
  field_note: 'Field Note',
  gate_recon: 'Gate Recon',
  storage_manifest: 'Storage Manifest',
  route_report: 'Route Report',
  market_report: 'Market Report',
  system_report: 'System Report',
  assembly_log: 'Assembly Log',
  hostile_contact: 'Hostile Contact',
  permit_report: 'Permit Report',
  access_denied: 'Access Denied',
  resource_report: 'Resource Report',
  after_action_report: 'After Action',
};

const authorLabels: Record<Signal['author']['kind'], string> = {
  anonymous_local: 'Anonymous',
  wallet: 'Wallet',
  character: 'Character',
};

const stalenessColors: Record<string, string> = {
  aging: 'text-yellow-500',
  stale: 'text-orange-500',
  critical: 'text-red-500',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SignalCard({ signal }: { signal: Signal }) {
  const entityLabel = signal.linkedEntities[0]?.label ?? 'Unknown';
  const staleness = evaluateSignalStaleness(signal);
  const showStaleness = staleness.level !== 'fresh';

  return (
    <div className="rounded border border-gray-800 bg-gray-900 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-gray-200">{signal.title}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400">{typeLabels[signal.signalType]}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <SignalConfidenceBadge confidence={signal.confidence} />
            {['tribe', 'officer', 'scout_cell'].includes(signal.visibility) ? (
              <TribeSignalScopeBadge signal={signal} />
            ) : (
              <SignalVisibilityBadge visibility={signal.visibility} />
            )}
            <SignalSyncBadge syncState={signal.syncState} />
            <RemoteSyncStatusBadge signal={signal} />
          </div>
          <div className="text-gray-500 space-x-2">
            <span>{entityLabel}</span>
            <span>·</span>
            <span>{authorLabels[signal.author.kind]}</span>
            <span>·</span>
            <span className={showStaleness ? stalenessColors[staleness.level] ?? 'text-gray-500' : 'text-gray-500'}>
              {timeAgo(signal.createdAt)}{showStaleness ? ` · ${staleness.level}` : ''}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <RemoteSyncButton signal={signal} />
        </div>
      </div>
      {signal.body && (
        <p className="mt-2 text-gray-400">{signal.body}</p>
      )}
      {signal.author.kind !== 'anonymous_local' &&
        signal.visibility !== 'local_private' &&
        (signal.syncState === 'local_only' || signal.syncState === 'sync_failed') && (
          <RemoteSyncExplainer />
        )}
    </div>
  );
}
