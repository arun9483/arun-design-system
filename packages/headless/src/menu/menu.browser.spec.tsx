import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Menu } from './index';
import type { MenuRootProps } from './MenuRoot';

/** Runs in a real browser: jsdom has no popover API, top layer, light dismiss or real focus. */

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

  it('moves to the next item starting with a typed character, cycling on repeats', async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard('d');
    expect(focused()).toBe(item('Duplicate'));
    await userEvent.keyboard('d');
    expect(focused()).toBe(item('Delete'));
    await userEvent.keyboard('d');
    expect(focused()).toBe(item('Duplicate'));
    // Archive is disabled, so typeahead skips it as the arrows do.
    await userEvent.keyboard('a');
    expect(focused()).toBe(item('Duplicate'));
  });

  it('matches a typed word, and forgets it after a pause', async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard('del');
    expect(focused()).toBe(item('Delete'));
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard('e');
    expect(focused()).toBe(item('Edit'));
  });
});

function Folders({ onNewFolder }: { onNewFolder: () => void }) {
  return (
    <Menu.Root>
      <Menu.Trigger>File</Menu.Trigger>
      <Menu.Popup data-testid="menu">
        <Menu.Item>New file</Menu.Item>
        <Menu.Item onClick={onNewFolder}>New folder</Menu.Item>
        <Menu.Item textValue="Open">
          <span aria-hidden>📂</span> <Label text="Open…" />
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}

function Label({ text }: { text: string }) {
  return <span>{text}</span>;
}

describe('Menu typeahead (browser)', () => {
  it('lets a Space continue a search instead of activating the item', async () => {
    const onNewFolder = vi.fn();
    render(<Folders onNewFolder={onNewFolder} />);
    await userEvent.click(screen.getByRole('button', { name: 'File' }));
    // Opening focuses New file, so "n" moves on to New folder — where the Space is typed.
    await userEvent.keyboard('new');
    expect(focused()).toBe(item('New folder'));
    await userEvent.keyboard('{ }fi');
    expect(focused()).toBe(item('New file'));
    // A search that matches nothing still owns its Space.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard('{ArrowDown}z{ }');
    expect(focused()).toBe(item('New folder'));
    expect(onNewFolder).not.toHaveBeenCalled();
    expect(isOpen()).toBe(true);
  });

  it('matches textValue when the text is rendered by a component', async () => {
    render(<Folders onNewFolder={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'File' }));
    await userEvent.keyboard('o');
    expect(focused()).toBe(item('Open…'));
  });
});

describe('Menu checkable items (browser)', () => {
  function View() {
    return (
      <Menu.Root>
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Popup data-testid="menu">
          <Menu.CheckboxItem>Show grid</Menu.CheckboxItem>
          <Menu.Group>
            <Menu.GroupLabel>Sort by</Menu.GroupLabel>
            <Menu.RadioGroup defaultValue="name">
              <Menu.RadioItem value="name">Name</Menu.RadioItem>
              <Menu.RadioItem value="size">Size</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Group>
        </Menu.Popup>
      </Menu.Root>
    );
  }
  const box = () => screen.getByRole('menuitemcheckbox', { name: 'Show grid', hidden: true });
  const radio = (name: string) => screen.getByRole('menuitemradio', { name, hidden: true });

  it('toggles with Space and Enter, staying open, and arrows run across groups', async () => {
    render(<View />);
    await userEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(focused()).toBe(box());
    await userEvent.keyboard('{ }');
    expect(box()).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Enter}');
    expect(box()).toHaveAttribute('aria-checked', 'false');
    expect(isOpen()).toBe(true);

    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(radio('Name'));
    await userEvent.keyboard('{ArrowDown}{ }');
    expect(radio('Size')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Name')).toHaveAttribute('aria-checked', 'false');
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(box());
  });
});

describe('Menu submenus (browser)', () => {
  function Nested({
    onEmail,
    onOpenChange,
  }: {
    onEmail?: () => void;
    onOpenChange?: (open: boolean) => void;
  }) {
    return (
      <Menu.Root>
        {/* Unstyled, items would sit in a row and the submenu would cover the next one. */}
        <style>{'[role="menu"]:popover-open { display: flex; flex-direction: column; }'}</style>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Popup data-testid="menu">
          <Menu.Item>Open</Menu.Item>
          <Menu.SubmenuRoot onOpenChange={onOpenChange}>
            <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
            <Menu.Popup data-testid="submenu">
              <Menu.Item onClick={onEmail}>Email</Menu.Item>
              <Menu.Item>Copy link</Menu.Item>
            </Menu.Popup>
          </Menu.SubmenuRoot>
          <Menu.Item>Print</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    );
  }
  const file = () => screen.getByRole('button', { name: 'File' });
  const share = () => item('Share');
  const submenu = () => screen.getByTestId('submenu');
  const subOpen = () => submenu().matches(':popover-open');
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('wires the trigger as a menuitem that opens a menu beside it', async () => {
    render(<Nested />);
    await userEvent.click(file());
    expect(share()).toHaveAttribute('aria-haspopup', 'menu');
    expect(share()).toHaveAttribute('aria-expanded', 'false');
    expect(share()).toHaveAttribute('aria-controls', submenu().id);
    expect(submenu()).toHaveAttribute('aria-labelledby', share().id);
    expect(submenu()).toHaveAttribute('data-side', 'right');
  });

  it('opens with → at its first item, and ← returns to the trigger, the parent open', async () => {
    render(<Nested />);
    await userEvent.click(file());
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(share());
    await userEvent.keyboard('{ArrowRight}');
    expect(subOpen()).toBe(true);
    expect(isOpen()).toBe(true);
    expect(share()).toHaveAttribute('aria-expanded', 'true');
    expect(focused()).toBe(item('Email'));
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(item('Copy link'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(subOpen()).toBe(false);
    expect(isOpen()).toBe(true);
    expect(focused()).toBe(share());
  });

  it('opens with Enter; Esc closes one level at a time', async () => {
    render(<Nested />);
    await userEvent.click(file());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(focused()).toBe(item('Email'));
    await userEvent.keyboard('{Escape}');
    expect(subOpen()).toBe(false);
    expect(isOpen()).toBe(true);
    expect(focused()).toBe(share());
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(focused()).toBe(file());
  });

  it('closes every level when an item in the submenu is activated', async () => {
    const onEmail = vi.fn();
    render(<Nested onEmail={onEmail} />);
    await userEvent.click(file());
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    expect(onEmail).toHaveBeenCalledOnce();
    expect(subOpen()).toBe(false);
    expect(isOpen()).toBe(false);
    expect(focused()).toBe(file());
  });

  it('closes the submenu when the arrow keys move to another item of the parent', async () => {
    render(<Nested />);
    await userEvent.click(file());
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.hover(share());
    await wait(200);
    expect(subOpen()).toBe(true);
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(item('Print'));
    expect(subOpen()).toBe(false);
  });

  it('opens on hover without moving focus, and closes on another item after the grace period', async () => {
    const onOpenChange = vi.fn();
    render(<Nested onOpenChange={onOpenChange} />);
    await userEvent.click(file());
    expect(focused()).toBe(item('Open'));
    await userEvent.hover(share());
    expect(subOpen()).toBe(false);
    await wait(200);
    expect(subOpen()).toBe(true);
    expect(focused()).toBe(item('Open'));

    // Straight onto Print: still inside the grace area at first, so the submenu stays…
    await userEvent.hover(item('Print'));
    expect(subOpen()).toBe(true);
    // …until the pointer moves on Print once the grace period is over.
    await wait(400);
    await userEvent.hover(item('Print'), { position: { x: 4, y: 4 } });
    expect(subOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('stays open as the pointer crosses into the submenu', async () => {
    render(<Nested />);
    await userEvent.click(file());
    await userEvent.hover(share());
    await wait(200);
    await userEvent.hover(item('Copy link'));
    await wait(400);
    await userEvent.hover(item('Email'));
    expect(subOpen()).toBe(true);
    await userEvent.click(item('Email'));
    expect(isOpen()).toBe(false);
  });

  it('closes only the submenu on a click elsewhere in the parent', async () => {
    render(<Nested />);
    await userEvent.click(file());
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(subOpen()).toBe(true);
    await userEvent.click(submenu().parentElement as HTMLElement, { position: { x: 2, y: 2 } });
    expect(subOpen()).toBe(false);
    expect(isOpen()).toBe(true);
  });
});
