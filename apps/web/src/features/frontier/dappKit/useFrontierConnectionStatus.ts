export type FrontierIntegrationStatus =
  | 'installed_unconfigured'
  | 'provider_boundary_ready'
  | 'runtime_error';

export function useFrontierConnectionStatus(): FrontierIntegrationStatus {
  return 'installed_unconfigured';
}
