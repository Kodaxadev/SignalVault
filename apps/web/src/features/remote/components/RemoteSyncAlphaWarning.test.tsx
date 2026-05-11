import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RemoteSyncAlphaWarning } from './RemoteSyncAlphaWarning';

describe('RemoteSyncAlphaWarning', () => {
  it('shows alpha and manual-only label by default', () => {
    render(<RemoteSyncAlphaWarning />);
    expect(screen.getByText('Alpha · Manual only')).toBeTruthy();
  });

  it('shows dev auth label when devAuthActive is true', () => {
    render(<RemoteSyncAlphaWarning devAuthActive />);
    expect(screen.getByText('Alpha · Dev auth · Manual only')).toBeTruthy();
  });

  it('shows standard label when devAuthActive is false', () => {
    render(<RemoteSyncAlphaWarning devAuthActive={false} />);
    expect(screen.getByText('Alpha · Manual only')).toBeTruthy();
  });
});
