import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickSignalButtons } from '@/features/signals';
import type { ResolvedEntity } from '@/features/entities';

const mockEntity: ResolvedEntity = {
  entityKey: 'item:utopia:12345',
  entityId: 'item:utopia:12345',
  type: 'smart_gate',
  label: 'Gate Alpha',
  confidence: 'url_hint',
  sources: ['url_hint'],
  sourceClaims: [],
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('QuickSignalButtons', () => {
  it('renders gate actions for smart_gate', () => {
    render(<QuickSignalButtons entityType="smart_gate" resolvedEntity={mockEntity} />);
    expect(screen.getByText('Passed')).toBeTruthy();
    expect(screen.getByText('Blocked')).toBeTruthy();
    expect(screen.getByText('Permit Required')).toBeTruthy();
    expect(screen.getByText('Hostile Nearby')).toBeTruthy();
  });

  it('renders storage actions for smart_storage_unit', () => {
    render(<QuickSignalButtons entityType="smart_storage_unit" resolvedEntity={{ ...mockEntity, type: 'smart_storage_unit' }} />);
    expect(screen.getByText('Access Worked')).toBeTruthy();
    expect(screen.getByText('Access Denied')).toBeTruthy();
    expect(screen.getByText('Mark Empty')).toBeTruthy();
  });

  it('renders unknown action for unknown type', () => {
    render(<QuickSignalButtons entityType="unknown" resolvedEntity={{ ...mockEntity, type: 'unknown' }} />);
    expect(screen.getByText('Log Field Signal')).toBeTruthy();
  });

  it('renders nothing for entity types with no actions', () => {
    const { container } = render(<QuickSignalButtons entityType="smart_turret" resolvedEntity={{ ...mockEntity, type: 'smart_turret' }} />);
    expect(container.firstChild).toBeNull();
  });
});
