import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InGameShell } from '@/app/InGameShell';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { MockAuthResult } from '@/features/viewer/ViewerSessionProvider';

// Mock all the hooks that InGameShell uses
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/ingame/object', search: '' }),
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock('@/features/entities/EntityResolutionProvider', () => ({
  useEntityResolution: () => ({
    getMemory: () => ({ entities: {} }),
  }),
}));

vi.mock('@/features/entities', () => ({
  parseObjectContext: () => ({ tenant: null, itemId: null }),
  hasObjectContext: () => true,
  resolveEntity: () => ({
    entityKey: 'item:test:1',
    entityId: 'item:test:1',
    type: 'smart_gate',
    label: 'Test Gate',
    confidence: 'cached',
    sources: [],
    sourceClaims: [],
    updatedAt: '2024-01-01T00:00:00Z',
  }),
}));

vi.mock('@/features/viewer', () => ({
  useViewerSession: () => ({
    viewer: { state: 'anonymous', roles: [] } as ViewerContext,
    actions: {
      consumeAccessCode: (): MockAuthResult => ({ success: false, error: { code: 'AUTH_CODE_INVALID', message: '' } }),
      connectWallet: (): MockAuthResult => ({ success: true, viewer: { state: 'wallet_connected', walletAddress: '0xmock', roles: [] } }),
      connectWalletFromFrontier: (): MockAuthResult => ({ success: true, viewer: { state: 'wallet_connected', walletAddress: '0xmock', roles: [] } }),
      resolveCharacter: (): MockAuthResult => ({ success: true, viewer: { state: 'character_resolved', walletAddress: '0xmock', characterId: 'c1', roles: [] } }),
      resolveCharacterFromFrontier: (): MockAuthResult => ({ success: true, viewer: { state: 'character_resolved', walletAddress: '0xmock', characterId: 'c1', roles: [] } }),
      disconnect: () => {},
    },
  }),
  ViewerBadge: ({ viewer }: { viewer: ViewerContext }) => <span data-testid="viewer-badge">{viewer.state}</span>,
  ConnectIdentityPanel: ({ onDone }: { onDone: () => void }) => (
    <div data-testid="connect-identity">
      <button onClick={onDone}>Done</button>
    </div>
  ),
}));

vi.mock('@/features/dossiers', () => ({
  ObjectDossier: ({ entity }: { entity: { label: string } }) => <div data-testid="object-dossier">{entity.label}</div>,
}));

vi.mock('@/features/ingame', () => ({
  InGameModeBanner: ({ viewer }: { viewer: { state: string } }) => <div data-testid="mode-banner">{viewer.state}</div>,
  InGameStatusRail: ({ viewer, entity, localStatus }: { viewer: { state: string }; entity: { type: string }; localStatus: string }) => (
    <div data-testid="status-rail">{viewer.state}-{entity.type}-{localStatus}</div>
  ),
  InGameActionPanel: ({ viewer, characterResolution, lastSignalMessage }: { viewer: { state: string }; characterResolution: { status: string }; lastSignalMessage?: string }) => (
    <div data-testid="action-panel">
      <span>{viewer.state}</span>
      <span>{characterResolution.status}</span>
      {lastSignalMessage && <span data-testid="signal-feedback">{lastSignalMessage}</span>}
    </div>
  ),
  TerminalPanel: ({ children }: { children: React.ReactNode }) => <div data-testid="terminal-panel">{children}</div>,
  InGameEmptyStates: {
    NoObjectContext: () => <div data-testid="no-object">No object</div>,
  },
}));

vi.mock('@/features/frontier', () => ({
  useSmartObjectContextAdapter: () => ({ status: 'unavailable', reason: 'provider_missing' as const }),
  useFrontierWalletAdapter: () => ({ status: 'unavailable', reason: 'provider_missing' as const }),
  useFrontierCharacterAdapter: () => ({ status: 'unavailable', reason: 'resolver_unavailable' as const }),
}));

vi.mock('@/features/local/localDbStatus', () => ({
  getLocalDbStatus: () => 'ready',
  subscribeLocalDbStatus: (fn: (s: { status: string }) => void) => {
    fn({ status: 'ready' });
    return () => {};
  },
}));

// Mock SignalProvider for QuickSignalButtons (via ObjectDossier)
vi.mock('@/features/signals/SignalProvider', () => ({
  useSignalContext: () => ({
    getAllSignals: () => [],
    addSignal: () => {},
    signals: [],
  }),
  SignalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('InGameShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mode banner', () => {
    render(<InGameShell />);
    expect(screen.getByTestId('mode-banner')).toBeInTheDocument();
  });

  it('renders status rail', () => {
    render(<InGameShell />);
    expect(screen.getByTestId('status-rail')).toBeInTheDocument();
  });

  it('renders action panel', () => {
    render(<InGameShell />);
    expect(screen.getByTestId('action-panel')).toBeInTheDocument();
  });

  it('renders object dossier when context exists', () => {
    render(<InGameShell />);
    expect(screen.getByTestId('object-dossier')).toBeInTheDocument();
  });

  it('does not show no-object when context exists', () => {
    render(<InGameShell />);
    expect(screen.queryByTestId('no-object')).not.toBeInTheDocument();
  });
});
