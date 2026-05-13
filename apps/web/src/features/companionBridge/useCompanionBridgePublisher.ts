import { useEffect } from 'react';
import type { RouteWarning } from '@/features/routes';
import type { Signal } from '@/features/signals';
import type { CurrentSystem } from '@/features/worldContext';
import { buildCompanionBridgeState } from './buildCompanionBridgeState';
import {
  publishCompanionBridgeState,
  type CompanionBridgePublishResult,
} from './publishCompanionBridgeState';

interface UseCompanionBridgePublisherInput {
  currentSystem: CurrentSystem | null;
  warnings: RouteWarning[];
  signals: Signal[];
  enabled?: boolean;
  publish?: (
    state: ReturnType<typeof buildCompanionBridgeState>,
  ) => Promise<CompanionBridgePublishResult>;
}

export function useCompanionBridgePublisher({
  currentSystem,
  warnings,
  signals,
  enabled = true,
  publish = publishCompanionBridgeState,
}: UseCompanionBridgePublisherInput): void {
  useEffect(() => {
    if (!enabled) return;

    const state = buildCompanionBridgeState({
      currentSystem,
      warnings,
      signals,
    });

    void publish(state);
  }, [currentSystem, warnings, signals, enabled, publish]);
}
