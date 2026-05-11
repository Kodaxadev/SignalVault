export type WorldApiEnvironment = 'stillness' | 'utopia';

export const WORLD_API_BASE_URLS: Partial<Record<WorldApiEnvironment, string>> = {
  utopia: 'https://world-api-utopia.uat.pub.evefrontier.com',
  stillness: 'https://world-api-stillness.live.tech.evefrontier.com',
};

export function getWorldApiBaseUrl(): string {
  const override = import.meta.env.VITE_WORLD_API_BASE_URL;
  if (override) return override;

  const env = (import.meta.env.VITE_WORLD_API_ENV as WorldApiEnvironment) ?? 'utopia';
  const configured = WORLD_API_BASE_URLS[env];
  if (!configured) {
    throw new Error(`World API base URL is not configured for ${env}`);
  }

  return configured;
}
