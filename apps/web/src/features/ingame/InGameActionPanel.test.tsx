import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InGameActionPanel } from '@/features/ingame/InGameActionPanel';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { CharacterResolutionUiState } from '@/features/ingame';

describe('InGameActionPanel', () => {
  const anonymousViewer: ViewerContext = { state: 'anonymous', roles: [] };
  const walletViewer: ViewerContext = { state: 'wallet_connected', walletAddress: '0xabc', roles: [] };
  const charViewer: ViewerContext = { state: 'character_resolved', walletAddress: '0xabc', characterId: 'c1', roles: [] };

  it('shows Connect Identity button for anonymous viewer', () => {
    render(
      <InGameActionPanel
        viewer={anonymousViewer}
        characterResolution={{ status: 'not_applicable' }}
        onConnectIdentity={() => {}}
        onResolveCharacter={() => {}}
      />,
    );
    expect(screen.getByText('Connect Identity')).toBeInTheDocument();
  });

  it('shows Resolve Character button when character available', () => {
    const charState: CharacterResolutionUiState = { status: 'available', label: 'Test Char' };
    render(
      <InGameActionPanel
        viewer={walletViewer}
        characterResolution={charState}
        onConnectIdentity={() => {}}
        onResolveCharacter={() => {}}
      />,
    );
    expect(screen.getByText('Resolve Character')).toBeInTheDocument();
  });

  it('shows character unavailable message with reason', () => {
    const charState: CharacterResolutionUiState = { status: 'unavailable', reason: 'resolver unavailable' };
    render(
      <InGameActionPanel
        viewer={walletViewer}
        characterResolution={charState}
        onConnectIdentity={() => {}}
        onResolveCharacter={() => {}}
      />,
    );
    expect(screen.getByText('Wallet connected.')).toBeInTheDocument();
    expect(screen.getByText(/Character data unavailable/)).toBeInTheDocument();
  });

  it('shows confirmation for character resolved', () => {
    render(
      <InGameActionPanel
        viewer={charViewer}
        characterResolution={{ status: 'not_applicable' }}
        onConnectIdentity={() => {}}
        onResolveCharacter={() => {}}
      />,
    );
    expect(screen.getByText('Character resolved. All Signal features available.')).toBeInTheDocument();
  });

  it('shows signal feedback message when present', () => {
    render(
      <InGameActionPanel
        viewer={anonymousViewer}
        characterResolution={{ status: 'not_applicable' }}
        lastSignalMessage="Gate blocked"
        onConnectIdentity={() => {}}
        onResolveCharacter={() => {}}
      />,
    );
    expect(screen.getByText(/Signal logged locally: Gate blocked/)).toBeInTheDocument();
  });

  it('calls onConnectIdentity when Connect Identity clicked', () => {
    const onConnect = vi.fn();
    render(
      <InGameActionPanel
        viewer={anonymousViewer}
        characterResolution={{ status: 'not_applicable' }}
        onConnectIdentity={onConnect}
        onResolveCharacter={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Connect Identity'));
    expect(onConnect).toHaveBeenCalledOnce();
  });

  it('calls onResolveCharacter when Resolve Character clicked', () => {
    const onResolve = vi.fn();
    render(
      <InGameActionPanel
        viewer={walletViewer}
        characterResolution={{ status: 'available', label: 'Test Char' }}
        onConnectIdentity={() => {}}
        onResolveCharacter={onResolve}
      />,
    );
    fireEvent.click(screen.getByText('Resolve Character'));
    expect(onResolve).toHaveBeenCalledOnce();
  });
});
