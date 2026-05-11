import { QueryClient } from '@tanstack/react-query';
import { EveFrontierProvider } from '@evefrontier/dapp-kit';

export function EveFrontierProviderBoundary({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  // TODO Phase 07C: add wallet connection provider here
  // TODO Phase 07D: add character resolver here
  return (
    <EveFrontierProvider queryClient={queryClient}>
      {children}
    </EveFrontierProvider>
  );
}
