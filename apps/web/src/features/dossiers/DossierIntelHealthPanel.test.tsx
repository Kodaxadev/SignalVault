import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DossierIntelHealthPanel } from './DossierIntelHealthPanel';
import type { StalenessSummary } from '@/features/staleness/staleSignalQueries';
import type { Contradiction } from '@/features/contradictions/contradictionTypes';

function makeContradiction(overrides: Partial<Contradiction> = {}): Contradiction {
  return {
    type: 'gate_passed_vs_blocked',
    severity: 'warning',
    signalA: {} as Contradiction['signalA'],
    signalB: {} as Contradiction['signalB'],
    description: 'Test contradiction',
    ...overrides,
  };
}

describe('DossierIntelHealthPanel', () => {
  const defaultStaleness: StalenessSummary = { total: 5, fresh: 3, aging: 1, stale: 1, critical: 0 };

  it('renders staleness summary', () => {
    render(
      <DossierIntelHealthPanel
        stalenessSummary={defaultStaleness}
        contradictions={[]}
        warnings={[]}
      />,
    );
    expect(screen.getByText(/3 fresh/)).toBeInTheDocument();
    expect(screen.getByText(/1 aging/)).toBeInTheDocument();
    expect(screen.getByText(/1 stale/)).toBeInTheDocument();
  });

  it('renders contradiction warnings', () => {
    const contradictions = [makeContradiction({ severity: 'critical', description: 'Gate passed vs blocked' })];
    render(
      <DossierIntelHealthPanel
        stalenessSummary={defaultStaleness}
        contradictions={contradictions}
        warnings={[]}
      />,
    );
    expect(screen.getByText(/Contradictions/)).toBeInTheDocument();
    expect(screen.getByText('Gate passed vs blocked')).toBeInTheDocument();
  });

  it('shows re-scout recommendation when critical staleness exists', () => {
    const staleness: StalenessSummary = { total: 5, fresh: 2, aging: 1, stale: 1, critical: 1 };
    render(
      <DossierIntelHealthPanel
        stalenessSummary={staleness}
        contradictions={[]}
        warnings={[]}
      />,
    );
    expect(screen.getByText(/Re-scout recommended/)).toBeInTheDocument();
  });

  it('shows re-scout recommendation when critical contradictions exist', () => {
    const contradictions = [makeContradiction({ severity: 'critical' })];
    render(
      <DossierIntelHealthPanel
        stalenessSummary={defaultStaleness}
        contradictions={contradictions}
        warnings={[]}
      />,
    );
    expect(screen.getByText(/Re-scout recommended/)).toBeInTheDocument();
  });

  it('renders warnings from props', () => {
    const warnings = ['Test warning 1', 'Test warning 2'];
    render(
      <DossierIntelHealthPanel
        stalenessSummary={defaultStaleness}
        contradictions={[]}
        warnings={warnings}
      />,
    );
    expect(screen.getByText('Test warning 1')).toBeInTheDocument();
    expect(screen.getByText('Test warning 2')).toBeInTheDocument();
  });

  it('does not show re-scout when only aging/stale (no critical)', () => {
    const staleness: StalenessSummary = { total: 5, fresh: 2, aging: 2, stale: 1, critical: 0 };
    render(
      <DossierIntelHealthPanel
        stalenessSummary={staleness}
        contradictions={[makeContradiction({ severity: 'warning' })]}
        warnings={[]}
      />,
    );
    expect(screen.queryByText(/Re-scout recommended/)).not.toBeInTheDocument();
  });
});
