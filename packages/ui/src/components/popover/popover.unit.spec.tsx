import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Popover } from './index';
import { Button } from '../button';

// Behaviour and placement are @arun-dev/headless's and are tested there, in a real
// browser. These check only what ui adds: the class name, and pass-through parts.
describe('Popover (ui)', () => {
  it('styles the popup, keeping its placement props', () => {
    render(
      <Popover.Root>
        <Popover.Popup data-testid="popup" className="wide" side="top" aria-label="Filters" />
      </Popover.Root>,
    );
    const popup = screen.getByTestId('popup');
    expect(popup).toHaveClass('popover', 'wide');
    expect(popup).toHaveAttribute('popover', 'auto');
    expect(popup).toHaveAttribute('data-side', 'top');
  });

  it('leaves Trigger and Close unstyled, and styled through a rendered Button', () => {
    render(
      <Popover.Root>
        <Popover.Trigger render={<Button />}>Filters</Popover.Trigger>
        <Popover.Popup aria-label="Filters">
          <Popover.Close>Done</Popover.Close>
        </Popover.Popup>
      </Popover.Root>,
    );
    expect(screen.getByText('Filters')).toHaveClass('btn');
    expect(screen.getByText('Filters')).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.getByText('Done').className).toBe('');
  });
});
