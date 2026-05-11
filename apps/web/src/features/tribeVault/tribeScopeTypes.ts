export type TribeScopeLevel = 'tribe' | 'officer' | 'scout_cell';

export const TRIBE_SCOPE_RANK: Record<TribeScopeLevel, number> = {
  tribe: 10,
  officer: 20,
  scout_cell: 30,
} as const;

export function scopeRank(scope: TribeScopeLevel): number {
  return TRIBE_SCOPE_RANK[scope];
}

export function isNarrower(a: TribeScopeLevel, b: TribeScopeLevel): boolean {
  return scopeRank(a) > scopeRank(b);
}
