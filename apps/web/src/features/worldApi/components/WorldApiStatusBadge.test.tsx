import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorldApiStatusBadge } from './WorldApiStatusBadge';

describe('WorldApiStatusBadge', () => {
  it('shows pending state with yellow dot', () => {
    render(<WorldApiStatusBadge status="pending" />);
    expect(document.querySelector('.bg-yellow-400')).toBeTruthy();
    expect(screen.getByText('pending')).toBeTruthy();
  });

  it('shows success state with green dot', () => {
    render(<WorldApiStatusBadge status="success" />);
    expect(document.querySelector('.bg-green-400')).toBeTruthy();
    expect(screen.getByText('success')).toBeTruthy();
  });

  it('shows unavailable state with gray dot', () => {
    render(<WorldApiStatusBadge status="unavailable" />);
    expect(document.querySelector('.bg-gray-500')).toBeTruthy();
    expect(screen.getByText('unavailable')).toBeTruthy();
  });

  it('shows cache state with cyan dot', () => {
    render(<WorldApiStatusBadge status="cache" />);
    expect(document.querySelector('.bg-cyan-400')).toBeTruthy();
    expect(screen.getByText('cache')).toBeTruthy();
  });

  it('shows stale state with orange dot', () => {
    render(<WorldApiStatusBadge status="stale" />);
    expect(document.querySelector('.bg-orange-400')).toBeTruthy();
    expect(screen.getByText('stale')).toBeTruthy();
  });

  it('cache title describes cached data', () => {
    render(<WorldApiStatusBadge status="cache" />);
    const wrapper = screen.getByText('cache').closest('[title]') as HTMLElement;
    expect(wrapper?.title).toContain('cached');
  });

  it('stale title mentions unavailable World API', () => {
    render(<WorldApiStatusBadge status="stale" />);
    const wrapper = screen.getByText('stale').closest('[title]') as HTMLElement;
    expect(wrapper?.title).toContain('unavailable');
  });
});
