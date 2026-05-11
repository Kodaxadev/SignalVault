import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntityResolutionBadge } from '@/features/entities';

describe('EntityResolutionBadge', () => {
  it('renders unknown state', () => {
    render(<EntityResolutionBadge confidence="unknown" />);
    expect(screen.getByText('Resolution: Unknown')).toBeTruthy();
  });

  it('renders url_hint state', () => {
    render(<EntityResolutionBadge confidence="url_hint" />);
    expect(screen.getByText('Resolution: URL Context')).toBeTruthy();
  });

  it('renders verified state', () => {
    render(<EntityResolutionBadge confidence="onchain_verified" />);
    expect(screen.getByText('Resolution: Verified')).toBeTruthy();
  });
});
