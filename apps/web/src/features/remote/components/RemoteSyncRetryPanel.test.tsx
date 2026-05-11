import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RemoteSyncRetryPanel } from './RemoteSyncRetryPanel';

describe('RemoteSyncRetryPanel', () => {
  it('shows local-preservation message', () => {
    render(<RemoteSyncRetryPanel onRetry={vi.fn()} />);
    expect(screen.getByText(/saved locally/i)).toBeTruthy();
  });

  it('shows retry button', () => {
    render(<RemoteSyncRetryPanel onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: /retry push/i })).toBeTruthy();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<RemoteSyncRetryPanel onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /retry push/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('disables retry button when disabled prop is true', () => {
    render(<RemoteSyncRetryPanel onRetry={vi.fn()} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows lastError when provided', () => {
    render(<RemoteSyncRetryPanel onRetry={vi.fn()} lastError="Network timeout" />);
    expect(screen.getByText('Network timeout')).toBeTruthy();
  });

  it('does not show error section when lastError is absent', () => {
    render(<RemoteSyncRetryPanel onRetry={vi.fn()} />);
    expect(screen.queryByText(/network/i)).toBeNull();
  });
});
