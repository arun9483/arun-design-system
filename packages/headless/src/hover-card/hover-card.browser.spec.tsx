import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HoverCard } from './index';
import type { HoverCardRootProps } from './HoverCardRoot';
import { Popover } from '../popover';

/**
 * Runs in Chromium: hover, :focus-visible, the popover API and anchor positioning are all
 * real here. Delays are short so the suite stays fast.
 */

// The real pointer stays where the last test left it, often over where the next trigger
// renders. Park it in a corner nothing is rendered in.
beforeEach(async () => {
  const corner = document.createElement('div');
  corner.style.cssText = 'position:fixed;right:0;bottom:0;width:4px;height:4px';
  document.body.append(corner);
  await userEvent.hover(corner);
  corner.remove();
});

function Basic(props: HoverCardRootProps) {
  return (
    <>
      <button type="button">Before</button>
      <HoverCard.Root delay={150} closeDelay={120} {...props}>
        <HoverCard.Trigger href="#ada" style={{ display: 'inline-block', margin: 120 }}>
          @ada
        </HoverCard.Trigger>
        <HoverCard.Popup data-testid="card" style={{ margin: 0, padding: 16 }}>
          Ada Lovelace — <a href="#profile">View profile</a>
        </HoverCard.Popup>
      </HoverCard.Root>
      <button type="button">After</button>
    </>
  );
}

const card = () => screen.getByTestId('card');
const trigger = () => screen.getByRole('link', { name: '@ada' });
const profile = () => screen.getByRole('link', { name: 'View profile' });
const isOpen = () => card().matches(':popover-open');
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('HoverCard', () => {
  it('is a manual popover anchored to a link trigger, with no role', () => {
    render(<Basic />);
    expect(trigger().tagName).toBe('A');
    expect(card()).toHaveAttribute('popover', 'manual');
    expect(card()).not.toHaveAttribute('role');
    expect(card()).toHaveAttribute('data-side', 'bottom');
    expect(card()).toHaveAttribute('data-closed');
    expect(trigger().style.getPropertyValue('anchor-name')).toMatch(/^--hl-anchor-/);
    expect(card().style.getPropertyValue('position-anchor')).toBe(
      trigger().style.getPropertyValue('anchor-name'),
    );
  });

  it('opens on hover only after the delay', async () => {
    render(<Basic />);
    await userEvent.hover(trigger());
    expect(isOpen()).toBe(false);
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    expect(card()).toHaveAttribute('data-open');
    expect(trigger()).toHaveAttribute('data-open');
  });

  it('does not open if the pointer leaves before the delay', async () => {
    render(<Basic delay={200} />);
    await userEvent.hover(trigger());
    await userEvent.hover(screen.getByRole('button', { name: 'After' }));
    await wait(300);
    expect(isOpen()).toBe(false);
  });

  it('stays open while the pointer moves onto the card, and closes when it leaves', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    await userEvent.hover(trigger());
    await vi.waitFor(() => expect(isOpen()).toBe(true));

    await userEvent.hover(card());
    await wait(250);
    expect(isOpen()).toBe(true);

    await userEvent.hover(screen.getByRole('button', { name: 'After' }));
    expect(isOpen()).toBe(true);
    await vi.waitFor(() => expect(isOpen()).toBe(false));
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('opens at once on keyboard focus, and Tab moves into the card', async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(trigger()).toHaveFocus();
    expect(isOpen()).toBe(true);

    await userEvent.tab();
    expect(profile()).toHaveFocus();
    expect(isOpen()).toBe(true);
  });

  it('is next in Tab order after the trigger, wherever it sits in the page', async () => {
    render(
      <HoverCard.Root>
        <button type="button">Before</button>
        <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
        <button type="button">Between</button>
        <HoverCard.Popup data-testid="card">
          <a href="#profile">View profile</a>
        </HoverCard.Popup>
      </HoverCard.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(isOpen()).toBe(true);
    // The trigger is the card's invoker, so Tab goes into the card before "Between".
    await userEvent.tab();
    expect(profile()).toHaveFocus();
  });

  it('closes when focus leaves both the trigger and the card', async () => {
    render(<Basic />);
    trigger().focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    expect(isOpen()).toBe(false);

    await userEvent.tab();
    await userEvent.tab();
    expect(profile()).toHaveFocus();
    await userEvent.tab();
    expect(isOpen()).toBe(false);
  });

  it('does not open on focus from a click', async () => {
    render(<Basic delay={5000} />);
    trigger().addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(trigger());
    expect(isOpen()).toBe(false);
  });

  it('closes on Esc, returning focus from the card to the trigger', async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await userEvent.tab();
    expect(profile()).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(trigger()).toHaveFocus();
  });

  it('never opens from touch', async () => {
    render(<Basic delay={0} />);
    // React derives onPointerEnter from pointerover, so that is what a finger sends here.
    trigger().dispatchEvent(
      new PointerEvent('pointerover', { pointerType: 'touch', bubbles: true }),
    );
    await wait(100);
    expect(isOpen()).toBe(false);
  });

  it('closes when the trigger is pressed', async () => {
    render(<Basic defaultOpen />);
    expect(isOpen()).toBe(true);
    trigger().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await vi.waitFor(() => expect(isOpen()).toBe(false));
  });

  it('follows a controlled parent', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Basic open={false} onOpenChange={onOpenChange} />);
    await userEvent.hover(trigger());
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(isOpen()).toBe(false);

    rerender(<Basic open onOpenChange={onOpenChange} />);
    expect(isOpen()).toBe(true);
  });

  it('leaves an open Popover open', async () => {
    render(
      <>
        <Popover.Root defaultOpen>
          <Popover.Trigger>Filters</Popover.Trigger>
          <Popover.Popup data-testid="popover" aria-label="Filters">
            <Basic />
          </Popover.Popup>
        </Popover.Root>
      </>,
    );
    const popover = screen.getByTestId('popover');
    await vi.waitFor(() => expect(popover.matches(':popover-open')).toBe(true));

    await userEvent.hover(trigger());
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    expect(popover.matches(':popover-open')).toBe(true);
  });
});
