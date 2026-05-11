import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewerSessionProvider, useViewerSession } from '@/features/viewer';
import type { FrontierWalletSnapshot } from '@/features/frontier/dappKit/frontierWalletTypes';
import type { FrontierCharacterSnapshot } from '@/features/frontier/character/frontierCharacterTypes';

function TestConsumer() {
  const { viewer, actions } = useViewerSession();
  return (
    <div>
      <span data-testid="viewer-state">{viewer.state}</span>
      {viewer.walletAddress && <span data-testid="wallet-address">{viewer.walletAddress}</span>}
      {viewer.characterName && <span data-testid="character-name">{viewer.characterName}</span>}
      {viewer.tribeName && <span data-testid="tribe-name">{viewer.tribeName}</span>}
      <button onClick={() => actions.consumeAccessCode('SCOUT-001')} data-testid="use-scout">
        Use Scout Code
      </button>
      <button onClick={() => actions.consumeAccessCode('OFFICER-001')} data-testid="use-officer">
        Use Officer Code
      </button>
      <button onClick={() => actions.consumeAccessCode('USED-001')} data-testid="use-expired">
        Use Expired Code
      </button>
      <button onClick={() => actions.consumeAccessCode('INVALID')} data-testid="use-invalid">
        Use Invalid Code
      </button>
      <button onClick={() => actions.disconnect()} data-testid="disconnect">
        Disconnect
      </button>
      <button
        onClick={() => {
          const snapshot: FrontierWalletSnapshot = {
            status: 'connected',
            walletAddress: '0xreal-wallet',
            source: 'eve_vault',
          };
          actions.connectWalletFromFrontier(snapshot);
        }}
        data-testid="connect-frontier"
      >
        Connect Frontier
      </button>
      <button
        onClick={() => {
          const snapshot: FrontierCharacterSnapshot = {
            status: 'resolved',
            source: 'mock',
            walletAddress: '0xreal-wallet',
            characterId: 'char-001',
            characterName: 'Resolved Char',
            tribeId: 'tribe-001',
            tribeName: 'Resolved Tribe',
          };
          actions.resolveCharacterFromFrontier(snapshot);
        }}
        data-testid="resolve-character"
      >
        Resolve Character
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ViewerSessionProvider>
      <TestConsumer />
    </ViewerSessionProvider>,
  );
}

describe('ViewerSessionProvider', () => {
  it('starts as anonymous', () => {
    renderWithProvider();
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('anonymous');
  });

  it('scout code switches to character_resolved with scout role', () => {
    renderWithProvider();
    fireEvent.click(screen.getByTestId('use-scout'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('character_resolved');
    expect(screen.getByTestId('character-name')).toHaveTextContent('Scout Alpha');
  });

  it('officer code switches to character_resolved with officer role and tribe', () => {
    renderWithProvider();
    fireEvent.click(screen.getByTestId('use-officer'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('character_resolved');
    expect(screen.getByTestId('character-name')).toHaveTextContent('Officer Beta');
    expect(screen.getByTestId('tribe-name')).toHaveTextContent('Clonebank 86');
  });

  it('expired code does not change viewer state', () => {
    renderWithProvider();
    fireEvent.click(screen.getByTestId('use-expired'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('anonymous');
  });

  it('invalid code does not change viewer state', () => {
    renderWithProvider();
    fireEvent.click(screen.getByTestId('use-invalid'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('anonymous');
  });

  it('disconnect returns to anonymous', () => {
    renderWithProvider();
    fireEvent.click(screen.getByTestId('use-scout'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('character_resolved');
    fireEvent.click(screen.getByTestId('disconnect'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('anonymous');
  });

  it('connectWalletFromFrontier upgrades to wallet_connected', () => {
    renderWithProvider();
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('anonymous');
    fireEvent.click(screen.getByTestId('connect-frontier'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('wallet_connected');
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('0xreal-wallet');
  });

  it('resolveCharacterFromFrontier upgrades wallet_connected to character_resolved', () => {
    renderWithProvider();
    // First connect wallet
    fireEvent.click(screen.getByTestId('connect-frontier'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('wallet_connected');

    // Then resolve character (button internally creates matching snapshot)
    fireEvent.click(screen.getByTestId('resolve-character'));
    expect(screen.getByTestId('viewer-state')).toHaveTextContent('character_resolved');
    expect(screen.getByTestId('character-name')).toHaveTextContent('Resolved Char');
    expect(screen.getByTestId('tribe-name')).toHaveTextContent('Resolved Tribe');
  });
});
