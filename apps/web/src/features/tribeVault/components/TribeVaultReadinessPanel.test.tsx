import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ViewerContext } from '@/features/viewer';
import { TribeVaultReadinessPanel } from './TribeVaultReadinessPanel';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

vi.mock('@/features/viewer', async () => {
  const actual = await vi.importActual('@/features/viewer');
  return {
    ...actual,
    useViewerSession: vi.fn(),
  };
});

const { useViewerSession } = await import('@/features/viewer');
const mockUseViewerSession = vi.mocked(useViewerSession);

describe('TribeVaultReadinessPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows unavailable for anonymous viewer', () => {
    mockUseViewerSession.mockReturnValue({
      viewer: { state: 'anonymous', roles: [] },
      actions: {} as any,
    });
    render(<TribeVaultReadinessPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('TRIBE VAULT UNAVAILABLE')).toBeTruthy();
  });

  it('shows unavailable for character without tribe', () => {
    const viewer: ViewerContext = { state: 'character_resolved', characterId: 'char-1', characterName: 'Test', roles: [] };
    mockUseViewerSession.mockReturnValue({ viewer, actions: {} as any });
    render(<TribeVaultReadinessPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('TRIBE VAULT UNAVAILABLE')).toBeTruthy();
  });

  it('shows readiness for character with tribe', () => {
    const viewer: ViewerContext = {
      state: 'character_resolved',
      characterId: 'char-1',
      characterName: 'Test',
      tribeId: 'tribe-1',
      tribeName: 'Test Tribe',
      roles: [],
    };
    mockUseViewerSession.mockReturnValue({ viewer, actions: {} as any });
    render(<TribeVaultReadinessPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('TRIBE VAULT STATUS')).toBeTruthy();
    expect(screen.getByText('Test Tribe')).toBeTruthy();
    expect(screen.getByText('tribe')).toBeTruthy();
  });
});
