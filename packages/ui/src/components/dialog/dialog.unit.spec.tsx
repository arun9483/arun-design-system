import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Dialog } from './index';
import { Button } from '../button';

// Behaviour is @arun-dev/headless's and is tested there, in a real browser. These check
// only what ui adds: class names, and that the unstyled parts pass through untouched.
describe('Dialog (ui)', () => {
  it('styles the popup and title', () => {
    render(
      <Dialog.Root>
        <Dialog.Popup data-testid="popup" className="wide">
          <Dialog.Title>Delete file</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    expect(screen.getByTestId('popup')).toHaveClass('dialog', 'wide');
    expect(screen.getByTestId('popup').tagName).toBe('DIALOG');
    expect(screen.getByText('Delete file')).toHaveClass('dialog-title');
  });

  it('leaves Trigger and Close unstyled, and styled through a rendered Button', () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger render={<Button variant="primary" />}>Open</Dialog.Trigger>
        <Dialog.Popup aria-label="Plain">
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    const trigger = screen.getByText('Open');
    expect(trigger).toHaveClass('btn', 'btn-primary');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.getByText('Close').className).toBe('');
  });
});
