// tribeVault — shared tribe intel policy model (local-only, no backend)
export type { TribeRoleName, TribeVaultPolicy, TribeIdentity, TribeVaultConfig } from './tribeVaultTypes';
export type { TribeScopeLevel } from './tribeScopeTypes';
export { TRIBE_SCOPE_RANK, scopeRank, isNarrower } from './tribeScopeTypes';
export type { TribePolicyDenialReason, TribePolicyResult } from './tribePolicyResults';
export { resolveTribeIdentity, getAvailableTribeScopes, evaluateCreateTribeScope, evaluateReadTribeScope, evaluateExportTribeScope, getLockedTribeScopes } from './tribePolicy';
export { filterSignalsByTribeScope, getTribeScopedSignals } from './tribeSignalFilters';
export { checkTribeVaultReadiness, type TribeVaultReadiness } from './tribeVaultReadiness';
export { TribeVaultUnavailable } from './components/TribeVaultUnavailable';
export { TribeScopeLockedBadge } from './components/TribeScopeLockedBadge';
export { TribeVaultReadinessPanel } from './components/TribeVaultReadinessPanel';
export { TribeScopeSelector } from './components/TribeScopeSelector';
export { TribeScopeExplainer } from './components/TribeScopeExplainer';
export { TribeSignalScopeBadge } from './components/TribeSignalScopeBadge';
