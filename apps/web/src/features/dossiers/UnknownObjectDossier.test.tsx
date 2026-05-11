import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnknownObjectDossier } from '@/features/dossiers';
import type { ResolvedEntity } from '@/features/entities';
import { createClaim } from '@/features/entities/entityClassificationTypes';

function makeResolved(overrides: Partial<ResolvedEntity> = {}): ResolvedEntity {
  return {
    entityKey: 'unknown',
    entityId: 'unknown',
    type: 'unknown',
    label: 'Unknown',
    confidence: 'unknown',
    sources: [],
    sourceClaims: [],
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('UnknownObjectDossier', () => {
  it('shows unknown object message when type is unknown', () => {
    render(<UnknownObjectDossier resolved={makeResolved()} />);
    expect(screen.getByText('Unknown Object')).toBeInTheDocument();
  });

  it('shows entity label when type is resolved', () => {
    const resolved = makeResolved({
      type: 'smart_gate',
      label: 'Gate Alpha-7',
      confidence: 'cached',
    });
    render(<UnknownObjectDossier resolved={resolved} />);
    expect(screen.getByText('Gate Alpha-7')).toBeInTheDocument();
  });

  it('shows ManualClassificationPanel when unknown', () => {
    const resolved = makeResolved({
      entityKey: 'item:utopia:12345',
    });
    render(<UnknownObjectDossier resolved={resolved} />);
    expect(screen.getByText('Classify Object')).toBeInTheDocument();
  });

  it('does not show ManualClassificationPanel when resolved', () => {
    const resolved = makeResolved({
      type: 'smart_gate',
      confidence: 'cached',
      label: 'Gate Alpha',
    });
    render(<UnknownObjectDossier resolved={resolved} />);
    expect(screen.queryByText('Classify Object')).not.toBeInTheDocument();
  });

  it('shows source claims even when unknown', () => {
    const claim = createClaim('item:test:1', 'unknown', 'url_hint', {});
    const resolved = makeResolved({
      entityKey: 'item:test:1',
      type: 'unknown',
      confidence: 'url_hint',
      sourceClaims: [claim],
    });
    render(<UnknownObjectDossier resolved={resolved} />);
    expect(screen.getByText(/We have context for this object, but not a verified type yet/)).toBeInTheDocument();
  });
});
