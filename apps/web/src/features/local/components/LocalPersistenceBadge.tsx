import { useState, useEffect } from 'react';
import { getLocalDbStatus, subscribeLocalDbStatus, type LocalDbStatusType } from '@/features/local/localDbStatus';

const STATUS_COLORS: Record<LocalDbStatusType, string> = {
  checking: 'bg-gray-400',
  ready: 'bg-green-500',
  degraded: 'bg-amber-500',
  unavailable: 'bg-red-500',
};

const STATUS_LABELS: Record<LocalDbStatusType, string> = {
  checking: 'Checking DB...',
  ready: 'Local DB',
  degraded: 'DB Degraded',
  unavailable: 'DB Unavailable',
};

export function LocalPersistenceBadge() {
  const [status, setStatus] = useState<LocalDbStatusType>(getLocalDbStatus);

  useEffect(() => {
    return subscribeLocalDbStatus((s) => setStatus(s.status));
  }, []);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
      {STATUS_LABELS[status]}
    </span>
  );
}
