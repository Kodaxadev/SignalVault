import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewerSessionProvider } from '@/features/viewer';
import { AccessCodePanel } from '@/features/viewer';

function renderPanel() {
  return render(
    <ViewerSessionProvider>
      <AccessCodePanel />
    </ViewerSessionProvider>,
  );
}

describe('AccessCodePanel', () => {
  it('renders input and connect button', () => {
    renderPanel();
    expect(screen.getByPlaceholderText('e.g. SCOUT-001')).toBeTruthy();
    expect(screen.getByText('Connect')).toBeTruthy();
  });

  it('shows error for invalid code', () => {
    renderPanel();
    const input = screen.getByPlaceholderText('e.g. SCOUT-001');
    fireEvent.change(input, { target: { value: 'BADCODE' } });
    fireEvent.click(screen.getByText('Connect'));
    expect(screen.getByText('Invalid access code.')).toBeTruthy();
  });

  it('shows error for empty input', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Connect'));
    expect(screen.getByText('Enter an access code.')).toBeTruthy();
  });

  it('shows success for valid scout code', () => {
    renderPanel();
    const input = screen.getByPlaceholderText('e.g. SCOUT-001');
    fireEvent.change(input, { target: { value: 'SCOUT-001' } });
    fireEvent.click(screen.getByText('Connect'));
    expect(screen.getByText('Identity connected. Session linked.')).toBeTruthy();
  });
});
