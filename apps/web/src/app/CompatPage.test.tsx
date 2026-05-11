import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompatPage } from '@/app/CompatPage';

describe('CompatPage', () => {
  it('renders diagnostics page with title and run button', () => {
    render(<CompatPage />);
    expect(screen.getByText('Browser Compatibility Diagnostics')).toBeTruthy();
    expect(screen.getByRole('button', { name: /run diagnostics/i })).toBeTruthy();
  });
});
