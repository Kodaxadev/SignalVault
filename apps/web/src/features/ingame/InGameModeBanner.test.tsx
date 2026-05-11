import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InGameModeBanner } from '@/features/ingame/InGameModeBanner';
import type { ViewerContext } from '@/features/viewer/viewerTypes';

describe('InGameModeBanner', () => {
  it('renders IDENTITY UNRESOLVED for anonymous viewer', () => {
    const viewer: ViewerContext = { state: 'anonymous', roles: [] };
    render(<InGameModeBanner viewer={viewer} />);
    expect(screen.getByText('IDENTITY UNRESOLVED')).toBeInTheDocument();
    expect(screen.getByText('Public dossier only. Local Signals are saved on this device.')).toBeInTheDocument();
  });

  it('renders WALLET CONNECTED for wallet_connected viewer', () => {
    const viewer: ViewerContext = { state: 'wallet_connected', walletAddress: '0xabc', roles: [] };
    render(<InGameModeBanner viewer={viewer} />);
    expect(screen.getByText('WALLET CONNECTED')).toBeInTheDocument();
    expect(screen.getByText('Private local Signals enabled. Resolve character to unlock character-attributed intel.')).toBeInTheDocument();
  });

  it('renders CHARACTER RESOLVED for character_resolved viewer', () => {
    const viewer: ViewerContext = { state: 'character_resolved', walletAddress: '0xabc', characterId: 'char-1', characterName: 'Test Char', roles: [] };
    render(<InGameModeBanner viewer={viewer} />);
    expect(screen.getByText('CHARACTER RESOLVED')).toBeInTheDocument();
    expect(screen.getByText('Signals are now attributed to your Frontier character.')).toBeInTheDocument();
  });
});
