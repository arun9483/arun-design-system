import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip } from './index';
import { Button } from '../button';

// Behaviour, timing and placement are @arun-dev/headless's and are tested there, in a real
// browser. These check only what ui adds.
describe('Tooltip (ui)', () => {
  it('styles the popup, keeping its placement props', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Popup data-testid="tip" className="wide" side="bottom">
          Saves the draft
        </Tooltip.Popup>
      </Tooltip.Root>,
    );
    const tip = screen.getByTestId('tip');
    expect(tip).toHaveClass('tooltip', 'wide');
    expect(tip).toHaveAttribute('role', 'tooltip');
    expect(tip).toHaveAttribute('data-side', 'bottom');
  });

  it('describes a Button rendered through the Trigger', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger render={<Button />}>Save</Tooltip.Trigger>
        <Tooltip.Popup data-testid="tip">Saves the draft</Tooltip.Popup>
      </Tooltip.Root>,
    );
    const save = screen.getByText('Save');
    expect(save).toHaveClass('btn');
    expect(save).toHaveAttribute('aria-describedby', screen.getByTestId('tip').id);
  });
});
