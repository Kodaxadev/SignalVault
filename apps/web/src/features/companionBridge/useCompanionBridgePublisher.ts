import { useEffect } from 'react';
import type { RouteWarning } from '@/features/routes';
import type { Signal } from '@/features/signals';
import type { CurrentSystem } from '@/features/worldContext';
import { buildCompanionBridgeState } from './buildCompanionBridgeState';
import type { CompanionBridgeStaticIntel } from './companionBridgeTypes';
import {
  publishCompanionBridgeState,
  type CompanionBridgePublishResult,
} from './publishCompanionBridgeState';

interface UseCompanionBridgePublisherInput {
  currentSystem: CurrentSystem | null;
  currentSystemStaticIntel?: CompanionBridgeStaticIntel | null;
  warnings: RouteWarning[];
  signals: Signal[];
  enabled?: boolean;
  publish?: (
    state: ReturnType<typeof buildCompanionBridgeState>,
  ) => Promise<CompanionBridgePublishResult>;
}

export function useCompanionBridgePublisher({
  currentSystem,
  currentSystemStaticIntel,
  warnings,
  signals,
  enabled = true,
  publish = publishCompanionBridgeState,
}: UseCompanionBridgePublisherInput): void {
  useEffect(() => {
    if (!enabled) return;

    const state = buildCompanionBridgeState({
      currentSystem,
      currentSystemStaticIntel,
      warnings,
      signals,
    });

    void publish(state);
  }, [currentSystem, currentSystemStaticIntel, warnings, signals, enabled, publish]);
}
