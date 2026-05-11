import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RemoteSyncStatusBadge } from './RemoteSyncStatusBadge';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    title: 'Test',
    body: '',
    signalType: 'field_note',
    confidence: 'observed',
    visibility: 'public',
    syncState: 'local_only',
    author: { kind: 'character', characterId: 'char-1', tribeId: 'tribe-1' },
    linkedEntities: [],
    createdInContext: { surface: 'external_app', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
    ...overrides,
  };
}

describe('RemoteSyncStatusBadge', () => {
  it('renders nothing for local_only signal', () => {
    const { container } = render(<RemoteSyncStatusBadge signal={makeSignal()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders remote badge with truncated ID when remote_saved', () => {
    const signal = makeSignal({
      syncState: 'remote_saved',
      remote: { remoteId: 'abcdef1234567890' },
    });
    render(<RemoteSyncStatusBadge signal={signal} />);
    expect(screen.getByText('Remote · abcdef12')).toBeTruthy();
  });

  it('renders nothing for remote_saved without remoteId', () => {
    const signal = makeSignal({ syncState: 'remote_saved' });
    const { container } = render(<RemoteSyncStatusBadge signal={signal} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders push failed badge for sync_failed', () => {
    const signal = makeSignal({
      syncState: 'sync_failed',
      remote: { lastError: 'Network timeout' },
    });
    render(<RemoteSyncStatusBadge signal={signal} />);
    const badge = screen.getByText('Push failed');
    expect(badge).toBeTruthy();
    expect(badge.title).toContain('preserved locally');
    expect(badge.title).toContain('Network timeout');
  });

  it('shows local-preservation message in title even without error detail', () => {
    const signal = makeSignal({ syncState: 'sync_failed' });
    render(<RemoteSyncStatusBadge signal={signal} />);
    expect(screen.getByText('Push failed').title).toContain('preserved locally');
  });

  it('renders remote_saved badge with full ID in title', () => {
    const signal = makeSignal({
      syncState: 'remote_saved',
      remote: { remoteId: 'abcdef1234567890' },
    });
    render(<RemoteSyncStatusBadge signal={signal} />);
    const badge = screen.getByText('Remote · abcdef12');
    expect(badge.title).toContain('abcdef1234567890');
  });

  it('renders syncing badge for remote_pending', () => {
    const signal = makeSignal({ syncState: 'remote_pending' });
    render(<RemoteSyncStatusBadge signal={signal} />);
    expect(screen.getByText('Syncing…')).toBeTruthy();
  });
});
