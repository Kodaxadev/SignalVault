import type { EntityType } from '@/features/entities';
import type { SignalConfidence, SignalType } from '@/features/signals/signalTypes';

export interface QuickSignalAction {
  id: string;
  label: string;
  entityTypes: EntityType[];
  signalType: SignalType;
  defaultConfidence: SignalConfidence;
}
