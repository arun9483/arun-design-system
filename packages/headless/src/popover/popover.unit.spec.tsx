import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Popover } from './index';

// Opening needs the popover API, which jsdom lacks: behaviour is in popover.browser.spec.tsx.
// These cover what renders while closed, which is where every popover starts.
describe('Popover (closed, jsdom)', () => {
  it('renders a closed auto popover and a native trigger button', () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup data-testid="popup" aria-label="Filters">
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>,
    );
    const popup = screen.getByTestId('popup');
    expect(popup.tagName).toBe('DIV');
    expect(popup).toHaveAttribute('popover', 'auto');
    expect(popup).toHaveAttribute('role', 'dialog');
    expect(popup).toHaveAttribute('data-closed');
    expect(popup).toHaveAttribute('data-side', 'bottom');
    expect(popup).toHaveAttribute('data-align', 'center');

    const trigger = screen.getByText('Open');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-controls', popup.id);
    expect(screen.getByText('Close')).toHaveAttribute('type', 'button');
  });

  it('gives each popover its own anchor name', () => {
    render(
      <>
        <Popover.Root>
          <Popover.Trigger data-testid="a" />
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger data-testid="b" />
        </Popover.Root>
      </>,
    );
    const a = screen.getByTestId('a').getAttribute('style');
    const b = screen.getByTestId('b').getAttribute('style');
    expect(a).toMatch(/anchor-name: --hl-anchor-[\w-]+/);
    expect(a).not.toBe(b);
  });

  it.each(['Trigger', 'Popup', 'Close'] as const)(
    'throws when Popover.%s is outside Popover.Root',
    (part) => {
      const Part = Popover[part];
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Part />)).toThrow(
        `<Popover.${part}> must be rendered inside <Popover.Root>.`,
      );
    },
  );
});
