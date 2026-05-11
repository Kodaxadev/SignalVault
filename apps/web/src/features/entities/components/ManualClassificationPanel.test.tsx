import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManualClassificationPanel } from './ManualClassificationPanel';
import { createManualClassificationMemory } from '../resolutionSources/resolveFromManualRegistry';
import { EntityResolutionProvider } from '../EntityResolutionProvider';
import { MemoryRouter } from 'react-router-dom';

function renderWithProvider(ui: React.ReactElement) {
  // Create a fresh provider wrapper that exposes manualMemory via closure
  const memory = createManualClassificationMemory();
  return {
    memory,
    ...render(
      <MemoryRouter>
        <EntityResolutionProvider>
          {ui}
        </EntityResolutionProvider>
      </MemoryRouter>,
    ),
  };
}

describe('ManualClassificationPanel', () => {
  it('renders dropdown with 9 options', () => {
    renderWithProvider(<ManualClassificationPanel entityKey="item:utopia:12345" />);

    const select = screen.getByTestId('entity-type-select');
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    // 1 placeholder + 9 entity types
    expect(options).toHaveLength(10);
  });

  it('submits selected classification', () => {
    let classified = false;
    renderWithProvider(
      <ManualClassificationPanel entityKey="item:utopia:12345" onClassified={() => { classified = true; }} />,
    );

    const select = screen.getByTestId('entity-type-select');
    fireEvent.change(select, { target: { value: 'smart_gate' } });

    const submitBtn = screen.getByText('Classify');
    fireEvent.click(submitBtn);

    expect(classified).toBe(true);
    expect(screen.getByText(/Object classified as/)).toBeInTheDocument();
  });

  it('shows success message after classification', () => {
    renderWithProvider(<ManualClassificationPanel entityKey="item:utopia:12345" />);

    const select = screen.getByTestId('entity-type-select');
    fireEvent.change(select, { target: { value: 'smart_turret' } });

    fireEvent.click(screen.getByText('Classify'));

    expect(screen.getByText(/Object classified as/)).toBeInTheDocument();
    expect(screen.getByText(/Smart Turret/)).toBeInTheDocument();
  });

  it('disables submit when no selection', () => {
    renderWithProvider(<ManualClassificationPanel entityKey="item:utopia:12345" />);

    const submitBtn = screen.getByText('Classify');
    expect(submitBtn).toBeDisabled();
  });
});
