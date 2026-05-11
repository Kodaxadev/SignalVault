import { describe, it, expect } from 'vitest';
import { EveFrontierProvider } from '@evefrontier/dapp-kit';

describe('dappKit smoke', () => {
  it('imports EveFrontierProvider without crashing', () => {
    expect(EveFrontierProvider).toBeDefined();
  });
});
