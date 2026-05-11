import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ObjectDossier } from './ObjectDossier';
import type { ResolvedEntity } from '@/features/entities';
import { SignalProvider } from '@/features/signals/SignalProvider';
import { MemoryRouter } from 'react-router-dom';

const makeEntity = (type: ResolvedEntity['type']): ResolvedEntity => ({
  entityKey: `item:test:${type}`,
  entityId: `item:test:${type}`,
  type,
  label: `Test ${type}`,
  confidence: 'url_hint',
  sources: [],
  sourceClaims: [],
  updatedAt: '2024-01-01T00:00:00Z',
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SignalProvider>
          {ui}
        </SignalProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ObjectDossier', () => {
  it('smart_gate → GateDossier', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('smart_gate')} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('SMART GATE');
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('smart_storage_unit → StorageDossier', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('smart_storage_unit')} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('STORAGE UNIT');
    expect(screen.getByText('Access Worked')).toBeInTheDocument();
  });

  it('market → MarketDossier', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('market')} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('MARKET');
    expect(screen.getByText('Market Open')).toBeInTheDocument();
  });

  it('system → SystemDossier', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('system')} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('SYSTEM');
    expect(screen.getByText('Hostile System')).toBeInTheDocument();
  });

  it('route → RouteDossier', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('route')} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('ROUTE');
    expect(screen.getByText('Route Safe')).toBeInTheDocument();
  });

  it('unknown → UnknownObjectDossier with manual classification', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('unknown')} />);
    expect(screen.getByText('Unknown Object')).toBeInTheDocument();
    expect(screen.getByText('Classify Object')).toBeInTheDocument();
  });

  it('unhandled type (smart_turret) → UnknownObjectDossier', () => {
    renderWithProviders(<ObjectDossier entity={makeEntity('smart_turret')} />);
    expect(screen.getByText('Test smart_turret')).toBeInTheDocument();
  });
});
