import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TribeScopeLockedBadge } from './TribeScopeLockedBadge';

describe('TribeScopeLockedBadge', () => {
  it('renders scope and locked text', () => {
    render(<TribeScopeLockedBadge scope="officer" reason="officer_role_missing" />);
    expect(screen.getByText('officer locked')).toBeTruthy();
  });

  it('shows reason as title', () => {
    render(<TribeScopeLockedBadge scope="scout_cell" reason="cell_identity_missing" />);
    const badge = screen.getByText('scout_cell locked');
    expect(badge.title).toBe('cell_identity_missing');
  });
});
