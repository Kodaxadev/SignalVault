import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoObjectContext, ObjectUnresolved, ManualClassificationNote } from '@/features/ingame/InGameEmptyStates';

describe('InGameEmptyStates', () => {
  it('NoObjectContext renders key label', () => {
    render(<NoObjectContext />);
    expect(screen.getByText('NO OBJECT DETECTED')).toBeInTheDocument();
  });

  it('ObjectUnresolved renders key label', () => {
    render(<ObjectUnresolved />);
    expect(screen.getByText('We have context for this object, but not a verified type yet.')).toBeInTheDocument();
  });

  it('ManualClassificationNote renders key label', () => {
    render(<ManualClassificationNote />);
    expect(screen.getByText(/MANUAL CLASSIFICATION/)).toBeInTheDocument();
  });
});
