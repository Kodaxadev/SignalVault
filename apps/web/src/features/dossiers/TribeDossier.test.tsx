import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ResolvedEntity } from '@/features/entities';
import { TribeDossier } from './TribeDossier';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

vi.mock('@/features/viewer', () => ({
  useViewerSession: vi.fn(() => ({
    viewer: { state: 'anonymous', roles: [] },
    actions: {} as any,
  })),
  anonymousViewer: vi.fn(() => ({ state: 'anonymous', roles: [] })),
}));

vi.mock('@/features/signals/SignalProvider', () => ({
  useSignalContext: vi.fn(() => ({
    getAllSignals: vi.fn(() => []),
    getSignals: vi.fn(() => []),
    addSignal: vi.fn(),
  })),
}));

vi.mock('@/features/worldApi/tribes/useTribeQuery', () => ({
  useTribeQuery: vi.fn(() => ({
    status: 'pending',
    data: undefined,
    isError: false,
  })),
}));

describe('TribeDossier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dossier header and tribe panels', () => {
    const entity: ResolvedEntity = {
      entityKey: 'tribe-1',
      entityId: 'tribe-1',
      type: 'tribe',
      label: 'Test Tribe',
      confidence: 'unknown',
      sources: [],
      sourceClaims: [],
      updatedAt: '2024-01-01T00:00:00Z',
    };
    render(<TribeDossier entity={entity} />, { wrapper: createWrapper() });
    expect(screen.getByText('SIGNAL VAULT // TRIBE')).toBeTruthy();
    expect(screen.getByText('Test Tribe')).toBeTruthy();
  });
});
