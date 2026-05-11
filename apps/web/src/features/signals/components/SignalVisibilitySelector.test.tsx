import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ViewerContext } from '@/features/viewer';
import { SignalVisibilitySelector } from './SignalVisibilitySelector';

vi.mock('@/features/tribeVault/components/TribeScopeSelector', () => ({
  TribeScopeSelector: vi.fn(({ viewer, selectedVisibility, onChange }) => (
    <div data-testid="mock-selector">
      <span data-testid="viewer-state">{viewer.state}</span>
      <span data-testid="selected">{selectedVisibility}</span>
      <button data-testid="change-btn" onClick={() => onChange('public')} />
    </div>
  )),
}));

describe('SignalVisibilitySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TribeScopeSelector with correct props', () => {
    const viewer: ViewerContext = { state: 'character_resolved', tribeId: 'tribe-1', roles: [] };
    render(
      <SignalVisibilitySelector
        viewer={viewer}
        selectedVisibility="tribe"
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('mock-selector')).toBeTruthy();
    expect(screen.getByTestId('selected').textContent).toBe('tribe');
  });
});
