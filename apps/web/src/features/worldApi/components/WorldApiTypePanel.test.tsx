import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorldApiTypePanel } from './WorldApiTypePanel';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

vi.mock('../types/useGameTypeQuery', () => ({
  useGameTypeQuery: vi.fn(),
}));

const { useGameTypeQuery } = await import('../types/useGameTypeQuery');
const mockUseGameTypeQuery = vi.mocked(useGameTypeQuery);

describe('WorldApiTypePanel', () => {
  const Wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when pending', () => {
    mockUseGameTypeQuery.mockReturnValue({ status: 'pending', data: undefined, isError: false } as any);
    render(<WorldApiTypePanel typeId="test-type" />, { wrapper: Wrapper });
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows unavailable state when error', () => {
    mockUseGameTypeQuery.mockReturnValue({ status: 'error', data: undefined, isError: true } as any);
    render(<WorldApiTypePanel typeId="test-type" />, { wrapper: Wrapper });
    expect(screen.getByText('World API data unavailable.')).toBeTruthy();
  });

  it('renders type data when loaded', () => {
    mockUseGameTypeQuery.mockReturnValue({
      status: 'success',
      data: {
        id: 'type-1',
        name: 'Test Type',
        description: 'A test type',
        groupId: 'group-1',
        groupName: 'Test Group',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
      },
      isError: false,
    } as any);
    render(<WorldApiTypePanel typeId="type-1" />, { wrapper: Wrapper });
    expect(screen.getByText('Test Type')).toBeTruthy();
    expect(screen.getByText('Test Group')).toBeTruthy();
    expect(screen.getByText('Test Category')).toBeTruthy();
    expect(screen.getByText('A test type')).toBeTruthy();
  });
});
