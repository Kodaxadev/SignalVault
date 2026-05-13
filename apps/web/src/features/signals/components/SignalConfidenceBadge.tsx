import type { SignalConfidence } from '@/features/signals/signalTypes';

const confidenceLabels: Record<SignalConfidence, string> = {
  unknown: 'Unknown',
  unverified: 'Unverified',
  rumor: 'Rumor',
  observed: 'Observed',
  corroborated: 'Corroborated',
  verified: 'Verified',
  stale: 'Stale',
  contradicted: 'Contradicted',
};

const confidenceColors: Record<SignalConfidence, string> = {
  unknown: 'bg-gray-700 text-gray-300',
  unverified: 'bg-zinc-800 text-zinc-300',
  rumor: 'bg-yellow-900 text-yellow-300',
  observed: 'bg-blue-900 text-blue-300',
  corroborated: 'bg-emerald-900 text-emerald-300',
  verified: 'bg-green-900 text-green-300',
  stale: 'bg-orange-900 text-orange-300',
  contradicted: 'bg-red-900 text-red-300',
};

export function SignalConfidenceBadge({ confidence }: { confidence: SignalConfidence }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${confidenceColors[confidence]}`}
    >
      {confidenceLabels[confidence]}
    </span>
  );
}
