import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Tooltip } from './index';
import type { TooltipRootProps } from './TooltipRoot';
import { Dialog } from '../dialog';
import { Popover } from '../popover';

/**
 * Runs in Chromium: hover, :focus-visible, the popover API and anchor positioning are all
 * real here. Delays are short so the suite stays fast.
 */

// Closing a tooltip warms the next for 300ms (TooltipRoot). Let it cool between tests, so
// each starts from a cold delay.
beforeEach(() => new Promise((resolve) => setTimeout(resolve, 350)));

function Basic(props: TooltipRootProps) {
  return (
    <>
      <button type="button">Before</button>
      <Tooltip.Root delay={150} closeDelay={80} {...props}>
        <Tooltip.Trigger style={{ margin: 120 }}>Save</Tooltip.Trigger>
        <Tooltip.Popup data-testid="tip">Saves the draft</Tooltip.Popup>
      </Tooltip.Root>
      <button type="button">After</button>
    </>
  );
}

const tip = () => screen.getByTestId('tip');
const trigger = () => screen.getByRole('button', { name: 'Save' });
const isOpen = () => tip().matches(':popover-open');
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Tooltip', () => {
  it('is a manual popover with role tooltip, describing the trigger', () => {
    render(<Basic />);
    expect(tip()).toHaveAttribute('popover', 'manual');
    expect(tip()).toHaveAttribute('role', 'tooltip');
    expect(trigger()).toHaveAttribute('aria-describedby', tip().id);
    expect(trigger()).toHaveAccessibleDescription('Saves the draft');
  });

  it('opens on hover only after the delay', async () => {
    render(<Basic />);
    await userEvent.hover(trigger());
    expect(isOpen()).toBe(false);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    expect(tip()).toHaveAttribute('data-open');
  });

  it('does not open if the pointer leaves before the delay', async () => {
    render(<Basic delay={200} />);
    await userEvent.hover(trigger());
    await userEvent.hover(screen.getByRole('button', { name: 'After' }));
    await wait(300);
    expect(isOpen()).toBe(false);
  });

  it('closes after the pointer leaves, once the grace period passes', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    await userEvent.hover(trigger());
    await vi.waitFor(() => expect(isOpen()).toBe(true));

    await userEvent.hover(screen.getByRole('button', { name: 'After' }));
    expect(isOpen()).toBe(true);
    await vi.waitFor(() => expect(isOpen()).toBe(false));
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('stays open while the pointer is on the tooltip (WCAG 1.4.13)', async () => {
    render(<Basic />);
    await userEvent.hover(trigger());
    await vi.waitFor(() => expect(isOpen()).toBe(true));

    await userEvent.hover(tip());
    await wait(200);
    expect(isOpen()).toBe(true);

    await userEvent.hover(screen.getByRole('button', { name: 'After' }));
    await vi.waitFor(() => expect(isOpen()).toBe(false));
  });

  it('opens at once on keyboard focus, and closes on blur', async () => {
    render(<Basic delay={5000} />);
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(trigger());
    expect(isOpen()).toBe(true);

    await userEvent.keyboard('{Tab}');
    expect(isOpen()).toBe(false);
  });

  it('does not open from a click', async () => {
    render(<Basic delay={5000} />);
    await userEvent.click(trigger());
    // Focused by the click, but not :focus-visible, and the press cancelled the hover.
    expect(document.activeElement).toBe(trigger());
    expect(isOpen()).toBe(false);
  });

  it('closes on a press of the trigger', async () => {
    render(<Basic defaultOpen />);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.click(trigger());
    expect(isOpen()).toBe(false);
  });

  it('never opens for touch', async () => {
    render(<Basic delay={0} />);
    trigger().dispatchEvent(
      new PointerEvent('pointerover', { bubbles: true, pointerType: 'touch' }),
    );
    trigger().dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
    await wait(100);
    expect(isOpen()).toBe(false);
  });

  it('closes on Esc, leaving a modal Dialog underneath open', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup data-testid="dialog" aria-label="Settings">
          <Basic delay={5000} />
        </Dialog.Popup>
      </Dialog.Root>,
    );
    trigger().focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}');
    expect(isOpen()).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect((screen.getByTestId('dialog') as HTMLDialogElement).open).toBe(true);
  });

  it('shows without closing an open Popover, and Esc closes only the tooltip', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Popup data-testid="popover" aria-label="Filters">
          <Basic delay={5000} />
        </Popover.Popup>
      </Popover.Root>,
    );
    const popover = screen.getByTestId('popover');
    await vi.waitFor(() => expect(popover.matches(':popover-open')).toBe(true));

    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.keyboard('{Tab}');
    expect(isOpen()).toBe(true);
    expect(popover.matches(':popover-open')).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(popover.matches(':popover-open')).toBe(true);
  });

  // A grace period of 100ms is the default: the first is still open as the pointer arrives.
  it.each([0, 100])(
    'skips the delay moving straight to the next tooltip (grace %ims)',
    async (grace) => {
      render(
        <>
          <Tooltip.Root delay={400} closeDelay={grace}>
            <Tooltip.Trigger>Bold</Tooltip.Trigger>
            <Tooltip.Popup data-testid="bold">Bold</Tooltip.Popup>
          </Tooltip.Root>
          <Tooltip.Root delay={400} closeDelay={grace}>
            <Tooltip.Trigger>Italic</Tooltip.Trigger>
            <Tooltip.Popup data-testid="italic">Italic</Tooltip.Popup>
          </Tooltip.Root>
        </>,
      );
      await userEvent.hover(screen.getByRole('button', { name: 'Bold' }));
      await vi.waitFor(() =>
        expect(screen.getByTestId('bold').matches(':popover-open')).toBe(true),
      );

      await userEvent.hover(screen.getByRole('button', { name: 'Italic' }));
      await wait(50);
      expect(screen.getByTestId('italic').matches(':popover-open')).toBe(true);
      await vi.waitFor(() =>
        expect(screen.getByTestId('bold').matches(':popover-open')).toBe(false),
      );
    },
  );

  it('is anchored above the trigger by default', async () => {
    render(<Basic defaultOpen />);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    const name = getComputedStyle(trigger()).getPropertyValue('anchor-name');
    expect(name).toMatch(/^--hl-anchor-/);
    expect(getComputedStyle(tip()).getPropertyValue('position-anchor')).toBe(name);
    expect(tip()).toHaveAttribute('data-side', 'top');
    expect(tip().getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger().getBoundingClientRect().top + 1,
    );
  });

  it('joins aria-describedby with your own', () => {
    render(
      <>
        <p id="hint">Ctrl+S</p>
        <Tooltip.Root>
          <Tooltip.Trigger aria-describedby="hint">Save</Tooltip.Trigger>
          <Tooltip.Popup data-testid="tip">Saves the draft</Tooltip.Popup>
        </Tooltip.Root>
      </>,
    );
    expect(trigger()).toHaveAttribute('aria-describedby', `hint ${tip().id}`);
    expect(trigger()).toHaveAccessibleDescription('Ctrl+S Saves the draft');
  });

  it('describes a Popover.Trigger rendered through it, and gets out of the way on press', async () => {
    render(
      <Popover.Root>
        <Tooltip.Root delay={100}>
          <Tooltip.Trigger render={<Popover.Trigger />}>Filters</Tooltip.Trigger>
          <Tooltip.Popup data-testid="tip">Filter the list</Tooltip.Popup>
        </Tooltip.Root>
        <Popover.Popup data-testid="popover" aria-label="Filters">
          Options
        </Popover.Popup>
      </Popover.Root>,
    );
    const filters = screen.getByRole('button', { name: 'Filters' });
    expect(filters).toHaveAttribute('aria-haspopup', 'dialog');
    expect(filters).toHaveAccessibleDescription('Filter the list');

    await userEvent.hover(filters);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.click(filters);
    expect(isOpen()).toBe(false);
    expect(screen.getByTestId('popover').matches(':popover-open')).toBe(true);
  });
});
