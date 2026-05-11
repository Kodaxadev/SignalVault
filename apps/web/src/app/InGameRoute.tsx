import { useQueryClient } from '@tanstack/react-query';
import { EveFrontierProviderBoundary } from '@/features/frontier';
import { InGameShell } from './InGameShell';

export default function InGameRoute() {
  const queryClient = useQueryClient();
  return (
    <EveFrontierProviderBoundary queryClient={queryClient}>
      <InGameShell />
    </EveFrontierProviderBoundary>
  );
}
