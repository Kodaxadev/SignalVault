import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouteWarningCard } from './RouteWarningCard';
import type { RouteWarning } from '../routeWarningTypes';

const warning: RouteWarning = {
  systemId: '30000013',
  systemName: 'Test System',
  level: 'critical',
  signalType: 'hostile_contact',
  signalCount: 1,
  latestSignalAt: new Date().toISOString(),
  stalenessLevel: 'fresh',
  isStale: false,
};

describe('RouteWarningCard', () => {
  it('renders advisory static route context when present', () => {
    render(
      <RouteWarningCard
        warning={{
          ...warning,
          staticIntel: {
            siteCount: 9,
            beltGroups: 3,
            trojanGroups: 2,
            dangerTaggedGroups: 5,
            tags: ['non_zero_danger_level'],
          },
        }}
      />,
    );

    expect(screen.getByText(/Static context: 9 sites/)).toBeTruthy();
    expect(screen.getByText(/3 belts/)).toBeTruthy();
    expect(screen.getByText(/2 trojans/)).toBeTruthy();
    expect(screen.getByText(/5 danger groups/)).toBeTruthy();
    expect(screen.getByText(/non zero danger level/)).toBeTruthy();
  });
});
