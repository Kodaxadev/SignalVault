import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ViewerContext } from '@/features/viewer';
import { TribeScopeExplainer } from './TribeScopeExplainer';

vi.mock('../tribePolicy', async () => {
  const actual = await vi.importActual('../tribePolicy');
  return {
    ...actual,
    resolveTribeIdentity: vi.fn(),
  };
});

const { resolveTribeIdentity } = await import('../tribePolicy');
const mockResolveTribeIdentity = vi.mocked(resolveTribeIdentity);

describe('TribeScopeExplainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no tribe identity', () => {
    mockResolveTribeIdentity.mockReturnValue(null);
    const { container } = render(<TribeScopeExplainer viewer={{ state: 'anonymous', roles: [] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('explains tribe scope with tribe name', () => {
    mockResolveTribeIdentity.mockReturnValue({
      tribeId: 'tribe-1',
      tribeName: 'Test Tribe',
      roles: [],
    });
    render(<TribeScopeExplainer viewer={{ state: 'character_resolved', tribeId: 'tribe-1', tribeName: 'Test Tribe', roles: [] } as ViewerContext} />);
    expect(screen.getByText(/Visible to all members of Test Tribe/)).toBeTruthy();
  });

  it('explains officer scope', () => {
    mockResolveTribeIdentity.mockReturnValue({
      tribeId: 'tribe-1',
      tribeName: 'Test Tribe',
      roles: [],
    });
    render(<TribeScopeExplainer viewer={{ state: 'character_resolved', tribeId: 'tribe-1', tribeName: 'Test Tribe', roles: [] } as ViewerContext} />);
    expect(screen.getByText('Visible to officers only. Requires officer role.')).toBeTruthy();
  });

  it('shows scout cell as locked', () => {
    mockResolveTribeIdentity.mockReturnValue({
      tribeId: 'tribe-1',
      tribeName: 'Test Tribe',
      roles: [],
    });
    render(<TribeScopeExplainer viewer={{ state: 'character_resolved', tribeId: 'tribe-1', tribeName: 'Test Tribe', roles: [] } as ViewerContext} />);
    expect(screen.getByText(/Locked: cell identity missing/)).toBeTruthy();
  });
});
