import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Popover } from './index';
import type { PopoverRootProps } from './PopoverRoot';
import type { PopoverPopupProps } from './PopoverPopup';

/**
 * Runs in Chromium: jsdom has no popover API, top layer, light dismiss or anchor
 * positioning. Placement is asserted as wiring and as geometry relative to the trigger,
 * not as pixel positions (decision 12).
 */

function Basic({
  side,
  align,
  ...root
}: PopoverRootProps & Pick<PopoverPopupProps, 'side' | 'align'>) {
  return (
    <>
      <Popover.Root {...root}>
        <Popover.Trigger style={{ margin: 200 }}>Filters</Popover.Trigger>
        <Popover.Popup
          data-testid="popup"
          aria-label="Filters"
          side={side}
          align={align}
          style={{ margin: 0 }}
        >
          <button type="button">Inside</button>
          <Popover.Close>Done</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <button type="button">Outside</button>
    </>
  );
}

const popup = () => screen.getByTestId('popup');
const trigger = () => screen.getByRole('button', { name: 'Filters' });
const isOpen = () => popup().matches(':popover-open');

describe('Popover', () => {
  it('opens from the Trigger as a native auto popover', async () => {
    render(<Basic />);
    expect(isOpen()).toBe(false);
    expect(popup()).toHaveAttribute('popover', 'auto');

    await userEvent.click(trigger());

    expect(isOpen()).toBe(true);
    expect(popup()).toHaveAttribute('data-open');
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBe(popup());
  });

  it('wires the Trigger to the popup', async () => {
    render(<Basic />);
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-controls', popup().id);

    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('data-open');
  });

  it('anchors the popup to the Trigger by a generated anchor name', () => {
    render(<Basic />);
    const name = getComputedStyle(trigger()).getPropertyValue('anchor-name');
    expect(name).toMatch(/^--hl-anchor-/);
    expect(getComputedStyle(popup()).getPropertyValue('position-anchor')).toBe(name);
  });

  // Read back as the browser serializes it: the horizontal keyword first.
  it.each([
    ['bottom', 'center', 'bottom'],
    ['bottom', 'start', 'span-right bottom'],
    ['top', 'end', 'span-left top'],
    ['right', 'start', 'right span-bottom'],
    ['left', 'center', 'left'],
  ] as const)('maps side=%s align=%s to position-area: %s', (side, align, area) => {
    render(<Basic side={side} align={align} />);
    expect(popup().style.getPropertyValue('position-area')).toBe(area);
    expect(popup()).toHaveAttribute('data-side', side);
    expect(popup()).toHaveAttribute('data-align', align);
  });

  it.each([
    ['bottom', (p: DOMRect, t: DOMRect) => p.top >= t.bottom - 1],
    ['top', (p: DOMRect, t: DOMRect) => p.bottom <= t.top + 1],
    ['right', (p: DOMRect, t: DOMRect) => p.left >= t.right - 1],
    ['left', (p: DOMRect, t: DOMRect) => p.right <= t.left + 1],
  ] as const)('opens on the %s side of the Trigger', async (side, isOnSide) => {
    render(<Basic side={side} />);
    await userEvent.click(trigger());
    expect(isOnSide(popup().getBoundingClientRect(), trigger().getBoundingClientRect())).toBe(true);
  });

  it('moves Tab from the Trigger into the popup', async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inside' }));
  });

  it('closes on Esc, reports it, and returns focus to the Trigger', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Tab}');

    await userEvent.keyboard('{Escape}');

    expect(isOpen()).toBe(false);
    expect(popup()).toHaveAttribute('data-closed');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on a click outside, and reports it', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('stays open on a click inside', async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Inside' }));
    expect(isOpen()).toBe(true);
  });

  it('toggles closed from the Trigger, without a light-dismiss reopen', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    expect(isOpen()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('closes from Popover.Close', async () => {
    render(<Basic defaultOpen />);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(isOpen()).toBe(false);
  });

  it('reopens after a light dismiss the controlled parent refuses', async () => {
    const onOpenChange = vi.fn();
    render(<Basic open onOpenChange={onOpenChange} />);
    await vi.waitFor(() => expect(isOpen()).toBe(true));

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
  });

  it('opens and closes as a controlled parent says', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)}>
            Toggle from outside
          </button>
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger>Filters</Popover.Trigger>
            <Popover.Popup data-testid="popup" aria-label="Filters">
              Content
            </Popover.Popup>
          </Popover.Root>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle from outside' }));
    // The outside button's own click is not a light dismiss of a popover that was closed.
    await vi.waitFor(() => expect(isOpen()).toBe(true));
  });

  it('closes the first popover when a second opens', async () => {
    const onFirst = vi.fn();
    render(
      <>
        <Popover.Root onOpenChange={onFirst}>
          <Popover.Trigger>First</Popover.Trigger>
          <Popover.Popup data-testid="first" aria-label="First">
            One
          </Popover.Popup>
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger>Second</Popover.Trigger>
          <Popover.Popup data-testid="second" aria-label="Second">
            Two
          </Popover.Popup>
        </Popover.Root>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'First' }));
    await userEvent.click(screen.getByRole('button', { name: 'Second' }));

    expect(screen.getByTestId('first').matches(':popover-open')).toBe(false);
    expect(screen.getByTestId('second').matches(':popover-open')).toBe(true);
    expect(onFirst.mock.calls).toEqual([[true], [false]]);
  });

  it('keeps a consumer style alongside the anchor styles', () => {
    render(
      <Popover.Root>
        <Popover.Trigger style={{ color: 'rgb(255, 0, 0)' }}>Filters</Popover.Trigger>
        <Popover.Popup data-testid="popup" aria-label="Filters" style={{ width: '10rem' }}>
          Content
        </Popover.Popup>
      </Popover.Root>,
    );
    expect(trigger().style.color).toBe('rgb(255, 0, 0)');
    expect(trigger().style.getPropertyValue('anchor-name')).toMatch(/^--hl-anchor-/);
    expect(popup().style.width).toBe('10rem');
    expect(popup().style.getPropertyValue('position-area')).toBe('bottom');
  });

  it('works inside a modal Dialog', async () => {
    const { Dialog } = await import('../dialog');
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup aria-label="Settings">
          <Basic />
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('{Escape}');
    // Esc closes the popover on top, not the dialog under it.
    expect(isOpen()).toBe(false);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('reports an open cancelled in onBeforeToggle as a close, and stays in step', async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover.Root onOpenChange={onOpenChange}>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Popup
          data-testid="popup"
          aria-label="Filters"
          onBeforeToggle={(event) => {
            if (event.newState === 'open') event.preventDefault();
          }}
        >
          Content
        </Popover.Popup>
      </Popover.Root>,
    );
    await userEvent.click(trigger());

    expect(isOpen()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(popup()).toHaveAttribute('data-closed');
  });
});
