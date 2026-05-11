import type { ResolutionConfidence } from '@/features/entities';

const confidenceLabels: Record<ResolutionConfidence, string> = {
  unknown: 'Unknown',
  url_hint: 'URL Context',
  manual: 'Manual',
  cached: 'Cached',
  indexed: 'Indexed',
  onchain_verified: 'Verified',
  conflicted: 'Conflicted',
};

const confidenceColors: Record<ResolutionConfidence, string> = {
  unknown: 'bg-gray-700 text-gray-300',
  url_hint: 'bg-yellow-900 text-yellow-300',
  manual: 'bg-blue-900 text-blue-300',
  cached: 'bg-purple-900 text-purple-300',
  indexed: 'bg-emerald-900 text-emerald-300',
  onchain_verified: 'bg-green-900 text-green-300',
  conflicted: 'bg-red-900 text-red-300',
};

export function EntityResolutionBadge({
  confidence,
}: {
  confidence: ResolutionConfidence;
}) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${confidenceColors[confidence]}`}
    >
      Resolution: {confidenceLabels[confidence]}
    </span>
  );
}
