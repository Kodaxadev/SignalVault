import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Signal } from '@/features/signals/signalTypes';
import { TribeSignalScopeBadge } from './TribeSignalScopeBadge';

const makeSignal = (visibility: string, tribeId?: string): Signal =>
  ({
    id: 'test',
    title: 'Test',
    body: '',
    signalType: 'field_note',
    confidence: 'observed',
    visibility: visibility as Signal['visibility'],
    syncState: 'local_only',
    author: { kind: 'character', tribeId },
    linkedEntities: [],
    createdInContext: { surface: 'ingame_object', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }) as Signal;

describe('TribeSignalScopeBadge', () => {
  it('returns null for non-tribe scopes', () => {
    const { container } = render(<TribeSignalScopeBadge signal={makeSignal('private')} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders tribe scope label', () => {
    render(<TribeSignalScopeBadge signal={makeSignal('tribe', 'tribe-123')} />);
    expect(screen.getByText(/Tribe/)).toBeTruthy();
  });

  it('renders officer scope label', () => {
    render(<TribeSignalScopeBadge signal={makeSignal('officer', 'tribe-123')} />);
    expect(screen.getByText(/Officer/)).toBeTruthy();
  });

  it('renders scout cell scope label', () => {
    render(<TribeSignalScopeBadge signal={makeSignal('scout_cell', 'tribe-123')} />);
    expect(screen.getByText(/Scout Cell/)).toBeTruthy();
  });

  it('shows truncated tribe ID', () => {
    render(<TribeSignalScopeBadge signal={makeSignal('tribe', 'tribe-123456789')} />);
    expect(screen.getByText(/tribe-123456…/)).toBeTruthy();
  });
});
