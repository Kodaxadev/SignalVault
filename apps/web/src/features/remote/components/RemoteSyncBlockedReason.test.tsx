import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RemoteSyncBlockedReason } from './RemoteSyncBlockedReason';
import type { BlockedSyncReason } from './RemoteSyncBlockedReason';

const cases: [BlockedSyncReason, RegExp][] = [
  ['no_backend_url', /vite_remote_sync_url/i],
  ['no_auth_method', /no auth method/i],
  ['signing_not_supported', /wallet signing not available/i],
  ['wallet_not_connected', /no wallet connected/i],
  ['provider_missing', /frontier client not detected/i],
  ['character_token_blocked', /character token not available/i],
];

describe('RemoteSyncBlockedReason', () => {
  it.each(cases)('renders actionable copy for %s', (reason, pattern) => {
    render(<RemoteSyncBlockedReason reason={reason} />);
    expect(screen.getByText(pattern)).toBeTruthy();
  });
});
