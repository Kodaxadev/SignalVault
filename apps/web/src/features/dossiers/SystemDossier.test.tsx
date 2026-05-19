import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SystemDossier } from '@/features/dossiers/SystemDossier';
import type { ResolvedEntity } from '@/features/entities';

vi.mock('@/features/signals/SignalProvider', () => ({
  useSignalContext: () => ({
    getAllSignals: () => [],
    getSignals: () => [],
    addSignal: () => {},
    signals: [],
  }),
  SignalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/features/worldApi/solarSystems/useSolarSystemQuery', () => ({
  useSolarSystemQuery: () => ({
    status: 'success',
    data: {
      id: '30000001',
      name: 'Test System',
      constellationId: '20000001',
      regionId: '10000001',
      connectedSystemIds: [],
    },
    isError: false,
    error: null,
  }),
}));

vi.mock('@/features/frontierStaticData/useFrontierSystemIntelQuery', () => ({
  useFrontierSystemIntelQuery: () => ({
    status: 'success',
    data: {
      siteCount: 9,
      beltGroups: 3,
      trojanGroups: 2,
      dangerTaggedGroups: 5,
      ecosystemIds: ['12'],
      ecosystemNames: ['Natural World - Trojan - Garden'],
      tags: ['belt', 'trojan', 'non_zero_danger_level'],
    },
    isError: false,
    error: null,
  }),
}));

const mockEntity: ResolvedEntity = {
  entityKey: '30000001',
  entityId: '30000001',
  type: 'system',
  label: 'Test System',
  confidence: 'manual',
  sources: ['user_manual'],
  sourceClaims: [],
  updatedAt: '2024-01-01T00:00:00Z',
};

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('SystemDossier with World API enrichment', () => {
  it('renders with official context panel when data available', () => {
    renderWithQueryClient(<SystemDossier entity={mockEntity} />);
    expect(screen.getByText('OFFICIAL SYSTEM CONTEXT')).toBeTruthy();
    expect(screen.getAllByText('Test System')).toHaveLength(2); // header + World API panel
  });

  it('renders warnings', () => {
    renderWithQueryClient(<SystemDossier entity={mockEntity} />);
    const warnings = screen.getAllByText('Manually classified — not yet verified.');
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });

  it('renders signal summary even with empty signals', () => {
    renderWithQueryClient(<SystemDossier entity={mockEntity} />);
    const noSignals = screen.getAllByText('No signals logged yet for this object.');
    expect(noSignals.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Frontier static site intel when compact index data is available', () => {
    renderWithQueryClient(<SystemDossier entity={mockEntity} />);

    expect(screen.getByText('STATIC SITE INTEL')).toBeTruthy();
    expect(screen.getByText('9 sites')).toBeTruthy();
    expect(screen.getByText('3 belts')).toBeTruthy();
    expect(screen.getByText('2 trojans')).toBeTruthy();
    expect(screen.getByText('5 danger groups')).toBeTruthy();
  });
});
