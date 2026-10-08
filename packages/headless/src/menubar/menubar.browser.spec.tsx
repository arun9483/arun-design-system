import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Menubar } from './index';
import type { MenubarRootProps } from './MenubarRoot';

/** Runs in Chromium: jsdom has no popover API, top layer, light dismiss or real focus. */

function Editor({ onNew, ...props }: MenubarRootProps & { onNew?: () => void }) {
  return (
    <>
      <button type="button">Before</button>
      <Menubar.Root aria-label="Editor" {...props}>
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Popup data-testid="file">
            <Menubar.Item onClick={onNew}>New</Menubar.Item>
            <Menubar.SubmenuRoot>
              <Menubar.SubmenuTrigger>Recent</Menubar.SubmenuTrigger>
              <Menubar.Popup data-testid="recent">
                <Menubar.Item>notes.md</Menubar.Item>
                <Menubar.Item>plan.md</Menubar.Item>
              </Menubar.Popup>
            </Menubar.SubmenuRoot>
            <Menubar.Item>Close</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Popup data-testid="edit">
            <Menubar.Item>Undo</Menubar.Item>
            <Menubar.Item>Redo</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger disabled>View</Menubar.Trigger>
          <Menubar.Popup data-testid="view">
            <Menubar.Item>Zoom</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Help</Menubar.Trigger>
          <Menubar.Popup data-testid="help">
            <Menubar.Item>About</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>
      <button type="button">After</button>
    </>
  );
}

const bar = () => screen.getByRole('menubar', { name: 'Editor' });
const trigger = (name: string) => screen.getByRole('menuitem', { name });
const item = (name: string) => screen.getByRole('menuitem', { name, hidden: true });
const isOpen = (testId: string) => screen.getByTestId(testId).matches(':popover-open');
const focused = () => document.activeElement;

describe('Menubar (browser)', () => {
  it('is a menubar of menuitems, one Tab stop, named by aria-label', async () => {
    render(<Editor />);
    expect(bar()).toHaveAttribute('aria-orientation', 'horizontal');
    expect(trigger('File')).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('File')).toHaveAttribute('tabindex', '0');
    expect(trigger('Edit')).toHaveAttribute('tabindex', '-1');
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    expect(focused()).toBe(trigger('File'));
    await userEvent.tab();
    expect(focused()).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('moves along the bar with ← and →, wrapping and skipping disabled, Home and End', async () => {
    render(<Editor />);
    trigger('File').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(trigger('Edit'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(trigger('Help'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(trigger('File'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(trigger('Help'));
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe(trigger('File'));
    await userEvent.keyboard('{End}');
    expect(focused()).toBe(trigger('Help'));
    // The Tab stop stays where focus left the bar.
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    expect(focused()).toBe(trigger('Help'));
  });

  it('opens with ↓, Enter and Space at the first item, and with ↑ at the last', async () => {
    render(<Editor />);
    trigger('Edit').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(isOpen('edit')).toBe(true);
    expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true');
    expect(focused()).toBe(item('Undo'));
    await userEvent.keyboard('{Escape}');
    expect(isOpen('edit')).toBe(false);
    expect(focused()).toBe(trigger('Edit'));
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe(item('Redo'));
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Enter}');
    expect(focused()).toBe(item('Undo'));
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{ }');
    expect(focused()).toBe(item('Undo'));
  });

  it('moves to the next and previous menu with → and ← from inside one, opening it', async () => {
    render(<Editor />);
    trigger('Edit').focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    expect(isOpen('edit')).toBe(false);
    expect(isOpen('help')).toBe(true);
    expect(focused()).toBe(item('About'));
    await userEvent.keyboard('{ArrowRight}');
    expect(isOpen('file')).toBe(true);
    expect(focused()).toBe(item('New'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(isOpen('file')).toBe(false);
    expect(isOpen('help')).toBe(true);
    expect(focused()).toBe(item('About'));
  });

  it('lets a SubmenuTrigger take → and a submenu take ←, before the bar', async () => {
    render(<Editor />);
    trigger('File').focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(item('Recent'));
    await userEvent.keyboard('{ArrowRight}');
    expect(isOpen('recent')).toBe(true);
    expect(focused()).toBe(item('notes.md'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(isOpen('recent')).toBe(false);
    expect(isOpen('file')).toBe(true);
    expect(focused()).toBe(item('Recent'));
    // → on an item of the submenu that opens nothing moves along the bar.
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(focused()).toBe(item('Undo'));
    expect(isOpen('file')).toBe(false);
    expect(isOpen('recent')).toBe(false);
  });

  it('activates an item, closing the menu with focus back on its Trigger', async () => {
    const onNew = vi.fn();
    render(<Editor onNew={onNew} />);
    await userEvent.click(trigger('File'));
    expect(focused()).toBe(item('New'));
    await userEvent.keyboard('{Enter}');
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(isOpen('file')).toBe(false);
    expect(focused()).toBe(trigger('File'));
  });

  it('switches menus as the pointer reaches another Trigger, only while one is open', async () => {
    render(<Editor />);
    await userEvent.hover(trigger('Edit'));
    expect(isOpen('edit')).toBe(false);
    await userEvent.click(trigger('File'));
    expect(isOpen('file')).toBe(true);
    await userEvent.hover(trigger('Edit'));
    expect(isOpen('file')).toBe(false);
    expect(isOpen('edit')).toBe(true);
    expect(focused()).toBe(trigger('Edit'));
    // A disabled menu does not open on hover.
    await userEvent.hover(trigger('View'));
    expect(isOpen('view')).toBe(false);
    expect(isOpen('edit')).toBe(true);
  });

  it('switches menus only when the pointer moves, not when the bar appears under a still one', async () => {
    // A bar laid out under a pointer that has not moved gets an enter from the browser; the
    // keyboard's open menu must stay.
    render(<Editor />);
    await userEvent.hover(trigger('File'));
    cleanup();
    render(<Editor />);
    trigger('Edit').focus();
    await userEvent.keyboard('{ArrowDown}');
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(isOpen('edit')).toBe(true);
    expect(isOpen('file')).toBe(false);
  });

  it('moves to the Trigger starting with a typed character', async () => {
    render(<Editor />);
    trigger('File').focus();
    await userEvent.keyboard('h');
    expect(focused()).toBe(trigger('Help'));
    await userEvent.keyboard('e');
    // "he" still matches Help; a pause starts a new search.
    expect(focused()).toBe(trigger('Help'));
  });

  it('keeps a disabled Trigger reachable with focusableWhenDisabled, never opening it', async () => {
    render(<Editor focusableWhenDisabled />);
    trigger('Edit').focus();
    await userEvent.keyboard('{ArrowRight}');
    const view = trigger('View');
    expect(focused()).toBe(view);
    expect(view).toHaveAttribute('aria-disabled', 'true');
    expect(view).not.toBeDisabled();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    // Playwright will not click an aria-disabled element; the DOM can.
    view.click();
    expect(isOpen('view')).toBe(false);
  });

  it("blocks a focusable disabled Trigger's own onClick, as a native disabled would", () => {
    const onClick = vi.fn();
    render(
      <Menubar.Root aria-label="Small" focusableWhenDisabled>
        <Menubar.Menu>
          <Menubar.Trigger disabled onClick={onClick}>
            Tools
          </Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item>Settings</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    trigger('Tools').click();
    expect(onClick).not.toHaveBeenCalled();
    expect(trigger('Tools')).toHaveAttribute('aria-expanded', 'false');
  });

  it('runs vertically: ↑ and ↓ along the bar, → opens beside it, ← closes back', async () => {
    render(<Editor orientation="vertical" />);
    expect(bar()).toHaveAttribute('aria-orientation', 'vertical');
    trigger('File').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(trigger('Edit'));
    expect(isOpen('edit')).toBe(false);
    await userEvent.keyboard('{ArrowRight}');
    expect(isOpen('edit')).toBe(true);
    expect(screen.getByTestId('edit')).toHaveAttribute('data-side', 'right');
    expect(focused()).toBe(item('Undo'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(isOpen('edit')).toBe(false);
    expect(focused()).toBe(trigger('Edit'));
  });

  it('swaps ← and → in a right-to-left bar', async () => {
    render(
      <div dir="rtl">
        <Editor />
      </div>,
    );
    trigger('File').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(trigger('Edit'));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowLeft}');
    expect(isOpen('help')).toBe(true);
    expect(focused()).toBe(item('About'));
  });
});
