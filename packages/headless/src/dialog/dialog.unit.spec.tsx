import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dialog } from './index';

// Opening needs showModal(), which jsdom lacks: behaviour is in dialog.browser.spec.tsx.
// These cover what renders while closed, which is where every dialog starts.
describe('Dialog (closed, jsdom)', () => {
  it('renders a closed native <dialog> and a native trigger button', () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup data-testid="popup">
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    const popup = screen.getByTestId('popup');
    expect(popup.tagName).toBe('DIALOG');
    expect(popup).not.toHaveAttribute('open');
    expect(popup).toHaveAttribute('data-closed');

    const trigger = screen.getByText('Open');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(screen.getByText('Close')).toHaveAttribute('type', 'button');
  });

  it('renders the Title as an h2 carrying the popup label id', () => {
    render(
      <Dialog.Root>
        <Dialog.Popup data-testid="popup">
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H2');
    expect(screen.getByTestId('popup')).toHaveAttribute('aria-labelledby', title.id);
  });

  it.each(['Trigger', 'Popup', 'Title', 'Close'] as const)(
    'throws when Dialog.%s is outside Dialog.Root',
    (part) => {
      const Part = Dialog[part];
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Part />)).toThrow(
        `<Dialog.${part}> must be rendered inside <Dialog.Root>.`,
      );
    },
  );
});
