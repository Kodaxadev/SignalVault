import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RemoteSyncExplainer } from './RemoteSyncExplainer';

describe('RemoteSyncExplainer', () => {
  it('renders alpha and local-preservation copy', () => {
    render(<RemoteSyncExplainer />);
    expect(screen.getByText(/alpha/i)).toBeTruthy();
    expect(screen.getByText(/preserved locally/i)).toBeTruthy();
  });

  it('mentions manual-only', () => {
    render(<RemoteSyncExplainer />);
    expect(screen.getByText(/manual/i)).toBeTruthy();
  });
});
