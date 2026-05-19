import type { RouteWarning } from '../routeWarningTypes';
import { RouteWarningCard } from './RouteWarningCard';

interface RouteWarningListProps {
  warnings: RouteWarning[];
  worldApiAvailable: boolean;
}

export function RouteWarningList({ warnings, worldApiAvailable }: RouteWarningListProps) {
  const hasStaticIntel = warnings.some((warning) => warning.staticIntel);

  if (warnings.length === 0) {
    return (
      <div className="text-xs text-gray-600 space-y-0.5">
        <p>No route warnings from local signals.</p>
        {!worldApiAvailable && (
          <p className="text-gray-700">World API unavailable — topology not loaded.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-gray-400">ROUTE WARNINGS</h3>
      {warnings.map((warning, i) => (
        <RouteWarningCard
          key={`${warning.systemId}:${warning.signalType}:${i}`}
          warning={warning}
        />
      ))}
      {hasStaticIntel && (
        <p className="text-xs text-gray-700 mt-1">
          Static context is alpha game-data enrichment, not live system state.
        </p>
      )}
      {!worldApiAvailable && (
        <p className="text-xs text-gray-700 mt-1">
          World API unavailable — warnings derived from local signals only.
        </p>
      )}
    </div>
  );
}
