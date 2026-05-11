export type TribeRoleName = 'officer' | 'scout' | 'member';

export type TribeVaultPolicy = 'tribe' | 'officer' | 'scout_cell';

export interface TribeIdentity {
  tribeId: string;
  tribeName: string;
  roles: TribeRoleName[];
}

export interface TribeVaultConfig {
  enabled: boolean;
  defaultScope: TribeVaultPolicy;
  availableScopes: TribeVaultPolicy[];
}
