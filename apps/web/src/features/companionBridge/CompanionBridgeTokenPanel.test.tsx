import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CompanionBridgeTokenPanel,
} from './CompanionBridgeTokenPanel';
import { companionBridgeTokenStorageKey } from './companionBridgeToken';

describe('CompanionBridgeTokenPanel', () => {
  it('stores a pairing token for bridge publishing', () => {
    render(<CompanionBridgeTokenPanel />);

    fireEvent.change(screen.getByLabelText('Bridge token'), {
      target: { value: 'paired-token' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Bridge Token' }));

    expect(localStorage.getItem(companionBridgeTokenStorageKey)).toBe('paired-token');
    expect(screen.getByText('saved')).toBeInTheDocument();
  });
});
