import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorldApiTribePanel } from './WorldApiTribePanel';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

vi.mock('../tribes/useTribeQuery', () => ({
  useTribeQuery: vi.fn(),
}));

const { useTribeQuery } = await import('../tribes/useTribeQuery');
const mockUseTribeQuery = vi.mocked(useTribeQuery);

describe('WorldApiTribePanel', () => {
  const Wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when pending', () => {
    mockUseTribeQuery.mockReturnValue({ status: 'pending', data: undefined, isError: false } as any);
    render(<WorldApiTribePanel tribeId="test-tribe" />, { wrapper: Wrapper });
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows unavailable state when error', () => {
    mockUseTribeQuery.mockReturnValue({ status: 'error', data: undefined, isError: true } as any);
    render(<WorldApiTribePanel tribeId="test-tribe" />, { wrapper: Wrapper });
    expect(screen.getByText('World API data unavailable.')).toBeTruthy();
  });

  it('renders tribe data when loaded', () => {
    mockUseTribeQuery.mockReturnValue({
      status: 'success',
      data: { id: 'tribe-1', name: 'Test Tribe', nameShort: 'TT', description: 'A test tribe' },
      isError: false,
    } as any);
    render(<WorldApiTribePanel tribeId="tribe-1" />, { wrapper: Wrapper });
    expect(screen.getByText('Test Tribe')).toBeTruthy();
    expect(screen.getByText('TT')).toBeTruthy();
    expect(screen.getByText('A test tribe')).toBeTruthy();
  });
});
