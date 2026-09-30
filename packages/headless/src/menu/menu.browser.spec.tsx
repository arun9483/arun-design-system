import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Menu } from './index';
import type { MenuRootProps } from './MenuRoot';

/** Runs in Chromium: jsdom has no popover API, top layer, light dismiss or real focus. */

function Basic({ onEdit, ...props }: MenuRootProps & { onEdit?: () => void }) {
  return (
    <>
      <Menu.Root {...props}>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup data-testid="menu">
          <Menu.Item onClick={onEdit}>Edit</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
          <Menu.Item disabled>Archive</Menu.Item>
          <Menu.Item>Delete</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <button type="button">After</button>
    </>
  );
}

const menu = () => screen.getByTestId('menu');
const trigger = () => screen.getByRole('button', { name: 'Actions' });
const item = (name: string) => screen.getByRole('menuitem', { name, hidden: true });
const isOpen = () => menu().matches(':popover-open');
const focused = () => document.activeElement;

describe('Menu (browser)', () => {
  it('opens on click as a native auto popover, focusing the first item', async () => {
    render(<Basic />);
    expect(isOpen()).toBe(false);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    expect(focused()).toBe(item('Edit'));
  });

  it('opens at the first item with Down, and at the last with Up', async () => {
    render(<Basic />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(item('Edit'));
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(focused()).toBe(trigger());
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe(item('Delete'));
  });

  it('opens with Enter and Space, as a native button', async () => {
    render(<Basic />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(focused()).toBe(item('Edit'));
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    await userEvent.keyboard('{ }');
    expect(isOpen()).toBe(true);
    expect(focused()).toBe(item('Edit'));
  });

  it('moves with Up and Down, skipping disabled items and wrapping', async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(item('Duplicate'));
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(item('Delete'));
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(item('Edit'));
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe(item('Delete'));
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe(item('Edit'));
    await userEvent.keyboard('{End}');
    expect(focused()).toBe(item('Delete'));
  });

  it('reaches disabled items with focusableWhenDisabled, without activating them', async () => {
    const onOpenChange = vi.fn();
    render(<Basic focusableWhenDisabled onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(item('Archive'));
    await userEvent.keyboard('{Enter}');
    expect(isOpen()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('activates an item with Enter, closes, and returns focus to the trigger', async () => {
    const onEdit = vi.fn();
    render(<Basic onEdit={onEdit} />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledOnce();
    expect(isOpen()).toBe(false);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(focused()).toBe(trigger());
  });

  it('closes on Esc and on a click outside, reporting both', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('closes on Tab and lets focus move on past the trigger', async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Tab}');
    expect(isOpen()).toBe(false);
    expect(focused()).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('reopens when a controlled parent refuses the close', async () => {
    const onOpenChange = vi.fn();
    render(<Basic open onOpenChange={onOpenChange} />);
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(isOpen()).toBe(true);
  });
});
