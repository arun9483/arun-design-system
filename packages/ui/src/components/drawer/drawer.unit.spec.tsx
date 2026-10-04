import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Drawer } from './index';
import { Button } from '../button';

// Behaviour is @arun-dev/headless's and is tested there, in a real browser. These check
// only what ui adds: class names, and that the unstyled parts pass through untouched.
describe('Drawer (ui)', () => {
  it('styles the popup and title, at the bottom by default', () => {
    render(
      <Drawer.Root>
        <Drawer.Popup data-testid="popup" className="tall">
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Popup>
      </Drawer.Root>,
    );
    const popup = screen.getByTestId('popup');
    expect(popup.tagName).toBe('DIALOG');
    expect(popup).toHaveClass('drawer', 'tall');
    expect(popup).toHaveAttribute('data-side', 'bottom');
    expect(screen.getByText('Filters')).toHaveClass('drawer-title');
  });

  it('passes the side through', () => {
    render(
      <Drawer.Root>
        <Drawer.Popup data-testid="popup" side="left" aria-label="Menu" />
      </Drawer.Root>,
    );
    expect(screen.getByTestId('popup')).toHaveAttribute('data-side', 'left');
  });

  it('leaves Trigger and Close unstyled, and styled through a rendered Button', () => {
    render(
      <Drawer.Root>
        <Drawer.Trigger render={<Button variant="primary" />}>Open</Drawer.Trigger>
        <Drawer.Popup aria-label="Plain">
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Popup>
      </Drawer.Root>,
    );
    const trigger = screen.getByText('Open');
    expect(trigger).toHaveClass('btn', 'btn-primary');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.getByText('Close').className).toBe('');
  });
});
