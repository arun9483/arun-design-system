import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ComponentEvent } from '../core/mergeProps';
import { Menu } from './index';
import type { MenuRootProps } from './MenuRoot';

function Basic({ onDelete, ...props }: MenuRootProps & { onDelete?: () => void }) {
  return (
    <Menu.Root {...props}>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item>Edit</Menu.Item>
        <Menu.Item disabled onClick={onDelete}>
          Delete
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}

// jsdom has no popover API, so these cover the markup and the state; the browser spec
// covers focus and keys.
describe('Menu', () => {
  it('renders the ARIA menu button pattern, wired by id', () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const menu = screen.getByRole('menu', { hidden: true });
    expect(trigger).toHaveAttribute('aria-controls', menu.id);
    expect(menu).toHaveAttribute('aria-labelledby', trigger.id);
    expect(menu).toHaveAttribute('popover', 'auto');

    const edit = screen.getByRole('menuitem', { name: 'Edit', hidden: true });
    expect(edit.tagName).toBe('BUTTON');
    expect(edit).toHaveAttribute('type', 'button');
    expect(edit).toHaveAttribute('tabindex', '-1');
  });

  it('anchors the popup to the trigger, at the bottom start by default', () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    const menu = screen.getByRole('menu', { hidden: true });
    const anchor = trigger.style.getPropertyValue('anchor-name');
    expect(anchor).toMatch(/^--hl-anchor-/);
    expect(menu).toHaveAttribute('data-side', 'bottom');
    expect(menu).toHaveAttribute('data-align', 'start');
  });

  it('toggles open from the trigger and reports it', () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-open');
  });

  it('closes when an item is activated', () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultOpen onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit', hidden: true }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('stays open when the item handler prevents the component handler', () => {
    const onOpenChange = vi.fn();
    render(
      <Menu.Root defaultOpen onOpenChange={onOpenChange}>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item
            onClick={(event) => (event as ComponentEvent<typeof event>).preventComponentHandler()}
          >
            Pin
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'Pin', hidden: true }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('makes a disabled item a native disabled button by default', () => {
    render(<Basic />);
    const del = screen.getByRole('menuitem', { name: 'Delete', hidden: true });
    expect(del).toBeDisabled();
    expect(del).not.toHaveAttribute('aria-disabled');
    expect(del).toHaveAttribute('data-disabled');
  });

  it('with focusableWhenDisabled, marks it aria-disabled and blocks activation', () => {
    const onOpenChange = vi.fn();
    const onDelete = vi.fn();
    render(
      <Basic defaultOpen focusableWhenDisabled onOpenChange={onOpenChange} onDelete={onDelete} />,
    );
    const del = screen.getByRole('menuitem', { name: 'Delete', hidden: true });
    expect(del).not.toBeDisabled();
    expect(del).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(del);
    expect(onDelete).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it.each(['Trigger', 'Popup', 'Item'] as const)(
    'throws when Menu.%s is outside Menu.Root',
    (part) => {
      const Part = Menu[part] as () => React.ReactNode;
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Part />)).toThrow(`<Menu.${part}> must be rendered inside <Menu.Root>.`);
    },
  );
});
