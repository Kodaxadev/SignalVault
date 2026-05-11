import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InGameObjectContextPanel } from '@/features/ingame/InGameObjectContextPanel';
import type { ResolvedEntity } from '@/features/entities';

function makeEntity(overrides: Partial<ResolvedEntity> = {}): ResolvedEntity {
  return {
    entityKey: 'item:test:1',
    entityId: 'item:test:1',
    type: 'smart_gate',
    label: 'Test Gate',
    confidence: 'cached',
    sources: [],
    sourceClaims: [],
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('InGameObjectContextPanel', () => {
  it('renders entity type label for known type', () => {
    render(<InGameObjectContextPanel entity={makeEntity()} />);
    expect(screen.getByText('Smart Gate')).toBeInTheDocument();
  });

  it('renders Unknown Object for unknown type', () => {
    render(<InGameObjectContextPanel entity={makeEntity({ type: 'unknown', confidence: 'unknown' })} />);
    expect(screen.getByText('Unknown Object')).toBeInTheDocument();
  });

  it('renders ObjectUnresolved for unknown with no source claims', () => {
    render(<InGameObjectContextPanel entity={makeEntity({ type: 'unknown', confidence: 'unknown', sourceClaims: [] })} />);
    expect(screen.getByText('We have context for this object, but not a verified type yet.')).toBeInTheDocument();
  });

  it('does NOT render ManualClassificationPanel (stays in UnknownObjectDossier)', () => {
    render(<InGameObjectContextPanel entity={makeEntity({ type: 'unknown', confidence: 'unknown' })} />);
    expect(screen.queryByText('Classify Object')).not.toBeInTheDocument();
  });

  it('renders entity details', () => {
    render(<InGameObjectContextPanel entity={makeEntity({ objectId: 'obj-123', tenant: 'test-tenant' })} />);
    expect(screen.getByText('obj-123')).toBeInTheDocument();
    expect(screen.getByText('test-tenant')).toBeInTheDocument();
  });
});
