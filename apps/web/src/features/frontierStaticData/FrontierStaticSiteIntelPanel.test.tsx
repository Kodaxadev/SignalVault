import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FrontierStaticSiteIntelPanel } from './FrontierStaticSiteIntelPanel';
import type { FrontierSystemIntelSummary } from './frontierStaticTypes';

const intel: FrontierSystemIntelSummary = {
  siteCount: 9,
  beltGroups: 3,
  trojanGroups: 2,
  dangerTaggedGroups: 5,
  ecosystemIds: ['12'],
  ecosystemNames: ['Natural World - Trojan - Garden'],
  tags: ['belt', 'trojan', 'non_zero_danger_level'],
};

describe('FrontierStaticSiteIntelPanel', () => {
  it('renders static site counts and danger tags', () => {
    render(<FrontierStaticSiteIntelPanel intel={intel} status="success" />);

    expect(screen.getByText('STATIC SITE INTEL')).toBeTruthy();
    expect(screen.getByText('9 sites')).toBeTruthy();
    expect(screen.getByText('3 belts')).toBeTruthy();
    expect(screen.getByText('2 trojans')).toBeTruthy();
    expect(screen.getByText('5 danger groups')).toBeTruthy();
    expect(screen.getByText(/non zero danger level/)).toBeTruthy();
  });

  it('degrades cleanly when the compact index is absent', () => {
    render(<FrontierStaticSiteIntelPanel intel={null} status="error" />);

    expect(screen.getByText('STATIC SITE INTEL')).toBeTruthy();
    expect(screen.getByText(/Static site data unavailable/)).toBeTruthy();
  });
});
