import type { RouteWarning, RouteWarningLevel } from '@/features/routes';
import type { Signal } from '@/features/signals';
import type { CurrentSystem } from '@/features/worldContext';
import type {
  CompanionBridgeStaticIntel,
  CompanionBridgeState,
  CompanionBridgeWarningLevel,
} from './companionBridgeTypes';

interface BuildCompanionBridgeStateInput {
  currentSystem: CurrentSystem | null;
  currentSystemStaticIntel?: CompanionBridgeStaticIntel | null;
  warnings: RouteWarning[];
  signals: Signal[];
  generatedAt?: string;
  latestSignalLimit?: number;
}

const DEFAULT_LATEST_SIGNAL_LIMIT = 5;

export function buildCompanionBridgeState({
  currentSystem,
  currentSystemStaticIntel,
  warnings,
  signals,
  generatedAt = new Date().toISOString(),
  latestSignalLimit = DEFAULT_LATEST_SIGNAL_LIMIT,
}: BuildCompanionBridgeStateInput): CompanionBridgeState {
  return {
    app: 'signal-vault',
    schemaVersion: 1,
    generatedAt,
    currentSystem: currentSystem
      ? {
          id: currentSystem.systemId,
          name: currentSystem.systemName,
          source: currentSystem.source,
        }
      : undefined,
    currentSystemStaticIntel: currentSystemStaticIntel ?? undefined,
    warnings: warnings.map((warning) => ({
      id: `${warning.systemId}:${warning.signalType}:${warning.latestSignalAt}`,
      level: mapWarningLevel(warning.level),
      title: formatSignalType(warning.signalType),
      detail: `${warning.signalCount} signal${warning.signalCount === 1 ? '' : 's'} on route.`,
      systemName: warning.systemName,
      updatedAt: warning.latestSignalAt,
    })),
    latestSignals: [...signals]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, latestSignalLimit)
      .map((signal) => ({
        id: signal.id,
        title: signal.title,
        type: signal.signalType,
        confidence: signal.confidence,
        visibility: signal.visibility,
        createdAt: signal.createdAt,
      })),
  };
}

function mapWarningLevel(level: RouteWarningLevel): CompanionBridgeWarningLevel {
  if (level === 'critical') return 'critical';
  if (level === 'info') return 'info';
  return 'warning';
}

function formatSignalType(signalType: string): string {
  return signalType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
