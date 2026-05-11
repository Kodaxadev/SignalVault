import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TribeVaultUnavailable } from './TribeVaultUnavailable';

describe('TribeVaultUnavailable', () => {
  it('renders reason message', () => {
    render(<TribeVaultUnavailable reason="Character resolved but no tribe detected" />);
    expect(screen.getByText('TRIBE VAULT UNAVAILABLE')).toBeTruthy();
    expect(screen.getByText('Character resolved but no tribe detected')).toBeTruthy();
  });
});
