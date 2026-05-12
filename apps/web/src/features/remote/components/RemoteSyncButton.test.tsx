import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Signal } from '@/features/signals/signalTypes';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { WalletSigningSnapshot } from '@/features/frontier/dappKit/walletSigningTypes';

vi.mock('@/features/signals/SignalProvider', () => ({
  useSignalContext: vi.fn(() => ({ updateSignal: vi.fn(), addSignal: vi.fn(), getSignals: vi.fn(), getAllSignals: vi.fn() })),
}));

vi.mock('@/features/viewer/ViewerSessionProvider', () => ({
  useViewerSession: vi.fn(() => ({
    viewer: {
      state: 'character_resolved',
      walletAddress: '0xabc',
      characterId: 'char-1',
      tribeId: 'tribe-1',
      roles: ['member'],
    } satisfies ViewerContext,
  })),
}));

const mockEnv: Record<string, string | undefined> = {
  VITE_REMOTE_SYNC_URL: 'http://localhost:3000',
  VITE_REMOTE_DEV_CHARACTER_JWT: 'eyJ.pay.sig',
};
vi.mock('@/lib/env', () => ({ env: mockEnv }));

vi.mock('../remoteDevCredentials', () => ({
  getRemoteDevCredentials: vi.fn(() => ({
    characterJwt: 'eyJ.pay.sig',
    walletSignature: 'wallet-sig',
    signatureMessage: 'signal-vault:dev',
  })),
  isRemoteDevAuthEnabled: vi.fn(() => true),
}));

const mockSigningSnapshot: { value: WalletSigningSnapshot } = {
  value: { status: 'unavailable', reason: 'provider_missing' },
};
vi.mock('../WalletSigningContext', () => ({
  useWalletSigningContext: vi.fn(() => mockSigningSnapshot.value),
}));

const { RemoteSyncButton } = await import('./RemoteSyncButton');
const { useSignalContext } = await import('@/features/signals/SignalProvider');
const { getRemoteDevCredentials, isRemoteDevAuthEnabled } = await import('../remoteDevCredentials');

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    title: 'Test',
    body: '',
    signalType: 'gate_recon',
    confidence: 'observed',
    visibility: 'public',
    syncState: 'local_only',
    author: { kind: 'character', characterId: 'char-1', tribeId: 'tribe-1' },
    linkedEntities: [{ entityId: 'item:utopia:1', label: 'Gate', type: 'smart_gate', resolutionConfidence: 'cached' }],
    createdInContext: { surface: 'ingame_object', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(useSignalContext).mockReturnValue({ updateSignal: vi.fn(), addSignal: vi.fn(), getSignals: vi.fn(), getAllSignals: vi.fn() });
  vi.mocked(getRemoteDevCredentials).mockReturnValue({
    characterJwt: 'eyJ.pay.sig',
    walletSignature: 'wallet-sig',
    signatureMessage: 'signal-vault:dev',
  });
  vi.mocked(isRemoteDevAuthEnabled).mockReturnValue(true);
  mockEnv.VITE_REMOTE_SYNC_URL = 'http://localhost:3000';
  mockEnv.VITE_REMOTE_DEV_CHARACTER_JWT = 'eyJ.pay.sig';
  mockSigningSnapshot.value = { status: 'unavailable', reason: 'provider_missing' };
});

describe('RemoteSyncButton', () => {
  it('shows "Local only" for local_private signal', () => {
    render(<RemoteSyncButton signal={makeSignal({ visibility: 'local_private' })} />);
    expect(screen.getByText('Local only')).toBeTruthy();
  });

  it('renders nothing for anonymous_local signal', () => {
    const { container } = render(
      <RemoteSyncButton signal={makeSignal({ author: { kind: 'anonymous_local' } })} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for remote_saved signal', () => {
    const { container } = render(
      <RemoteSyncButton signal={makeSignal({ syncState: 'remote_saved', remote: { remoteId: 'uuid-1' } })} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows "Syncing…" for remote_pending signal', () => {
    render(<RemoteSyncButton signal={makeSignal({ syncState: 'remote_pending' })} />);
    expect(screen.getByText('Syncing…')).toBeTruthy();
  });

  it('shows "Push remote" button for eligible signal with dev auth', () => {
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.getByRole('button', { name: /push remote/i })).toBeTruthy();
  });

  it('shows alpha warning when auth is available', () => {
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.getByText(/alpha/i)).toBeTruthy();
  });

  it('labels dev auth as active in alpha warning', () => {
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.getByText(/dev auth/i)).toBeTruthy();
  });

  it('shows RemoteSyncRetryPanel for sync_failed signal', () => {
    render(<RemoteSyncButton signal={makeSignal({ syncState: 'sync_failed', remote: { lastError: 'timeout' } })} />);
    expect(screen.getByText(/saved locally/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /retry push/i })).toBeTruthy();
    expect(screen.getByText('timeout')).toBeTruthy();
  });

  it('shows no_backend_url blocked reason when URL is missing', () => {
    mockEnv.VITE_REMOTE_SYNC_URL = undefined;
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText(/vite_remote_sync_url/i)).toBeTruthy();
  });

  it('shows signing_not_supported reason when no auth and signing unsupported', () => {
    vi.mocked(isRemoteDevAuthEnabled).mockReturnValue(false);
    vi.mocked(getRemoteDevCredentials).mockReturnValue(null);
    mockSigningSnapshot.value = { status: 'unavailable', reason: 'signing_not_supported' };
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText(/wallet signing not available/i)).toBeTruthy();
  });

  it('shows "Push remote" when signing is available, dev auth disabled, and no JWT is configured', () => {
    vi.mocked(isRemoteDevAuthEnabled).mockReturnValue(false);
    vi.mocked(getRemoteDevCredentials).mockReturnValue(null);
    mockEnv.VITE_REMOTE_DEV_CHARACTER_JWT = undefined;
    mockSigningSnapshot.value = {
      status: 'available',
      walletAddress: '0xabc',
      signMessage: vi.fn(),
    };
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.getByRole('button', { name: /push remote/i })).toBeTruthy();
  });

  it('shows "Push remote" when signing is available, dev auth disabled, JWT present', () => {
    vi.mocked(isRemoteDevAuthEnabled).mockReturnValue(false);
    vi.mocked(getRemoteDevCredentials).mockReturnValue(null);
    mockSigningSnapshot.value = {
      status: 'available',
      walletAddress: '0xabc',
      signMessage: vi.fn(),
    };
    render(<RemoteSyncButton signal={makeSignal()} />);
    expect(screen.getByRole('button', { name: /push remote/i })).toBeTruthy();
  });
});
