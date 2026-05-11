import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ViewerContext } from '@/features/viewer';
import { TribeScopeSelector } from './TribeScopeSelector';

vi.mock('@/features/signals/signalVisibilityOptions', async () => {
  const actual = await vi.importActual('@/features/signals/signalVisibilityOptions');
  return {
    ...actual,
    getAvailableSignalVisibilities: vi.fn(),
  };
});

const { getAvailableSignalVisibilities } = await import('@/features/signals/signalVisibilityOptions');
const mockGetAvailableSignalVisibilities = vi.mocked(getAvailableSignalVisibilities);

const characterViewer = (tribeId?: string, roles: string[] = []): ViewerContext => ({
  state: 'character_resolved',
  walletAddress: '0xwallet',
  characterId: 'char-1',
  characterName: 'Test',
  tribeId,
  roles,
});

describe('TribeScopeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders available options as clickable buttons', () => {
    mockGetAvailableSignalVisibilities.mockReturnValue([
      { visibility: 'private', label: 'Private', available: true },
      { visibility: 'public', label: 'Public', available: true },
      { visibility: 'tribe', label: 'Tribe', available: true },
    ]);
    render(
      <TribeScopeSelector
        viewer={characterViewer('tribe-1')}
        selectedVisibility="private"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Private')).toBeTruthy();
    expect(screen.getByText('Public')).toBeTruthy();
    expect(screen.getByText('Tribe')).toBeTruthy();
  });

  it('shows locked options as disabled', () => {
    mockGetAvailableSignalVisibilities.mockReturnValue([
      { visibility: 'private', label: 'Private', available: true },
      { visibility: 'officer', label: 'Officer', available: false, reason: 'officer_role_missing' },
    ]);
    render(
      <TribeScopeSelector
        viewer={characterViewer('tribe-1')}
        selectedVisibility="private"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Officer (locked)')).toBeTruthy();
    const officerBtn = screen.getByTitle('officer_role_missing');
    expect(officerBtn).toBeDisabled();
  });
});
