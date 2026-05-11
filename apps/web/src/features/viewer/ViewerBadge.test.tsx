import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViewerBadge } from '@/features/viewer/ViewerBadge';
import { anonymousViewer } from '@/features/viewer';

describe('ViewerBadge', () => {
  it('renders anonymous state', () => {
    const viewer = anonymousViewer('test');
    render(<ViewerBadge viewer={viewer} />);
    expect(screen.getByText('IDENTITY UNRESOLVED')).toBeTruthy();
  });

  it('shows character name when resolved', () => {
    render(
      <ViewerBadge
        viewer={{
          state: 'character_resolved',
          characterName: 'TestPilot',
          roles: [],
        }}
      />,
    );
    expect(screen.getByText('CHARACTER RESOLVED')).toBeTruthy();
    expect(screen.getByText('TestPilot')).toBeTruthy();
  });

  it('shows tribe name when available', () => {
    render(
      <ViewerBadge
        viewer={{
          state: 'character_resolved',
          characterName: 'TestPilot',
          tribeName: 'Clonebank 86',
          roles: [],
        }}
      />,
    );
    expect(screen.getByText('| Clonebank 86')).toBeTruthy();
  });
});
