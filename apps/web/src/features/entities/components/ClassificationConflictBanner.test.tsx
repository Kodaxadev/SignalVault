import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassificationConflictBanner } from './ClassificationConflictBanner';
import { createClaim } from '../entityClassificationTypes';

describe('ClassificationConflictBanner', () => {
  it('renders null when no conflicting claims', () => {
    const { container } = render(<ClassificationConflictBanner conflictingClaims={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders conflict banner with disagreement text', () => {
    const claim1 = createClaim('item:utopia:12345', 'smart_gate', 'url_hint', {});
    const claim2 = createClaim('item:utopia:12345', 'item', 'url_hint', {});

    render(<ClassificationConflictBanner conflictingClaims={[claim1, claim2]} />);

    expect(screen.getByText('Classification Conflict')).toBeInTheDocument();
    expect(screen.getByText(/Sources disagree/)).toBeInTheDocument();
  });

  it('shows conflicting type labels', () => {
    const claim1 = createClaim('item:utopia:12345', 'smart_gate', 'url_hint', {});
    const claim2 = createClaim('item:utopia:12345', 'item', 'url_hint', {});

    render(<ClassificationConflictBanner conflictingClaims={[claim1, claim2]} />);

    expect(screen.getByText('Smart Gate')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
  });
});
