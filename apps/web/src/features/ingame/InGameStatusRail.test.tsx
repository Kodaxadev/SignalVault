import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InGameStatusRail } from '@/features/ingame/InGameStatusRail';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { ResolvedEntity } from '@/features/entities';

function makeEntity(overrides: Partial<ResolvedEntity> = {}): ResolvedEntity {
  return {
    entityKey: 'item:test:1',
    entityId: 'item:test:1',
    type: 'smart_gate',
    label: 'Test Gate',
    confidence: 'cached',
    sources: [],
    sourceClaims: [],
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('InGameStatusRail', () => {
  const anonymousViewer: ViewerContext = { state: 'anonymous', roles: [] };
  const walletViewer: ViewerContext = { state: 'wallet_connected', walletAddress: '0xabc', roles: [] };
  const charViewer: ViewerContext = { state: 'character_resolved', walletAddress: '0xabc', characterId: 'c1', characterName: 'Test Char', roles: [] };

  it('renders identity label for anonymous', () => {
    render(<InGameStatusRail viewer={anonymousViewer} entity={makeEntity()} localStatus="ready" />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('renders identity label for wallet connected', () => {
    render(<InGameStatusRail viewer={walletViewer} entity={makeEntity()} localStatus="ready" />);
    expect(screen.getByText('Wallet connected')).toBeInTheDocument();
  });

  it('renders character name for character resolved', () => {
    render(<InGameStatusRail viewer={charViewer} entity={makeEntity()} localStatus="ready" />);
    expect(screen.getByText('Test Char')).toBeInTheDocument();
  });

  it('renders entity type and confidence', () => {
    render(<InGameStatusRail viewer={anonymousViewer} entity={makeEntity()} localStatus="ready" />);
    expect(screen.getByText('Gate · cached')).toBeInTheDocument();
  });

  it('renders local DB status', () => {
    render(<InGameStatusRail viewer={anonymousViewer} entity={makeEntity()} localStatus="ready" />);
    expect(screen.getByText('Local DB ready')).toBeInTheDocument();
  });

  it('renders DB unavailable state', () => {
    render(<InGameStatusRail viewer={anonymousViewer} entity={makeEntity()} localStatus="unavailable" />);
    expect(screen.getByText('DB unavailable')).toBeInTheDocument();
  });
});
