import type { Signal } from '@/features/signals/signalTypes';
import { isRemoteVisibility } from './remoteSignalTypes';

export type EligibilityBlockReason =
  | 'signal_local_private'
  | 'anonymous_author'
  | 'visibility_not_remote_eligible';

export type SignalEligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: EligibilityBlockReason; message: string };

export function checkSignalEligibility(signal: Signal): SignalEligibilityResult {
  if (signal.visibility === 'local_private') {
    return {
      eligible: false,
      reason: 'signal_local_private',
      message: 'local_private signals cannot be synced remotely. Change visibility first.',
    };
  }

  if (signal.author.kind === 'anonymous_local') {
    return {
      eligible: false,
      reason: 'anonymous_author',
      message: 'Signals authored anonymously cannot be synced remotely.',
    };
  }

  if (!isRemoteVisibility(signal.visibility)) {
    return {
      eligible: false,
      reason: 'visibility_not_remote_eligible',
      message: `Visibility "${signal.visibility}" is not supported for remote sync.`,
    };
  }

  return { eligible: true };
}
