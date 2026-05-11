import type { SystemContext } from '@/features/worldApi/solarSystems/solarSystemExtractors';
import type { TribeContext } from '@/features/worldApi/tribes/tribeExtractors';
import type { TypeContext } from '@/features/worldApi/types/gameTypeExtractors';

export type WorldApiEntityContext =
  | { kind: 'system'; context: SystemContext }
  | { kind: 'tribe'; context: TribeContext }
  | { kind: 'type'; context: TypeContext };
