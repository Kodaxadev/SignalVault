import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewerSessionProvider } from '@/features/viewer';
import { CompanionBridgePublisher } from '@/features/companionBridge';
import { EntityResolutionProvider } from '@/features/entities/EntityResolutionProvider';
import { SignalProvider } from '@/features/signals/SignalProvider';
import { CurrentSystemProvider } from '@/features/worldContext';
import { AppRoutes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ViewerSessionProvider>
          <EntityResolutionProvider>
            <SignalProvider>
              <CurrentSystemProvider>
                <AppRoutes />
                <CompanionBridgePublisher />
              </CurrentSystemProvider>
            </SignalProvider>
          </EntityResolutionProvider>
        </ViewerSessionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
