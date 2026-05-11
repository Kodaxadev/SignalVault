import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletSigningProvider, useWalletSigningContext } from './WalletSigningContext';
import type { WalletSigningSnapshot } from '@/features/frontier/dappKit/walletSigningTypes';

function ReadSnapshot() {
  const snapshot = useWalletSigningContext();
  return <div data-testid="status">{snapshot.status}</div>;
}

describe('WalletSigningContext', () => {
  it('returns unavailable by default (no provider)', () => {
    render(<ReadSnapshot />);
    expect(screen.getByTestId('status').textContent).toBe('unavailable');
  });

  it('returns the provided snapshot when wrapped', () => {
    const snapshot: WalletSigningSnapshot = {
      status: 'available',
      walletAddress: '0xabc',
      signMessage: async () => 'sig',
    };
    render(
      <WalletSigningProvider snapshot={snapshot}>
        <ReadSnapshot />
      </WalletSigningProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('available');
  });

  it('returns unavailable snapshot when provider passes unavailable', () => {
    const snapshot: WalletSigningSnapshot = {
      status: 'unavailable',
      reason: 'wallet_not_connected',
    };
    render(
      <WalletSigningProvider snapshot={snapshot}>
        <ReadSnapshot />
      </WalletSigningProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('unavailable');
  });
});
