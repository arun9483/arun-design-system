import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ComponentEvent } from '../core/mergeProps';
import { Menu } from './index';
import type { MenuRootProps } from './MenuRoot';
import type { MenuCheckboxItemProps } from './MenuCheckboxItem';
import type { MenuRadioGroupProps } from './MenuRadioGroup';

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

  it.each(['Trigger', 'Popup', 'Item', 'CheckboxItem', 'Group', 'RadioGroup'] as const)(
    'throws when Menu.%s is outside Menu.Root',
    (part) => {
      const Part = Menu[part] as () => React.ReactNode;
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Part />)).toThrow(`<Menu.${part}> must be rendered inside <Menu.Root>.`);
    },
  );

  it.each([
    ['RadioItem', <Menu.RadioItem key="a" value="a" />, '<Menu.RadioGroup>'],
    ['ItemIndicator', <Menu.ItemIndicator key="b" />, '<Menu.CheckboxItem> or <Menu.RadioItem>'],
    ['GroupLabel', <Menu.GroupLabel key="c" />, '<Menu.Group> or <Menu.RadioGroup>'],
  ])('throws when Menu.%s is outside its parent', (part, element, parent) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Menu.Root>{element}</Menu.Root>)).toThrow(
      `<Menu.${part}> must be rendered inside ${parent}.`,
    );
  });
});

describe('Menu.CheckboxItem', () => {
  function View(props: MenuCheckboxItemProps) {
    return (
      <Menu.Root defaultOpen onOpenChange={onOpenChange}>
        <Menu.Popup>
          <Menu.CheckboxItem {...props}>
            <Menu.ItemIndicator data-testid="indicator" />
            Show grid
          </Menu.CheckboxItem>
        </Menu.Popup>
      </Menu.Root>
    );
  }
  const onOpenChange = vi.fn();
  const item = () => screen.getByRole('menuitemcheckbox', { name: 'Show grid', hidden: true });

  it('toggles aria-checked and its data-* on the item and indicator, staying open', () => {
    onOpenChange.mockClear();
    const onCheckedChange = vi.fn();
    render(<View onCheckedChange={onCheckedChange} />);
    expect(item()).toHaveAttribute('aria-checked', 'false');
    expect(item()).toHaveAttribute('data-unchecked');
    expect(screen.getByTestId('indicator')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('indicator')).toHaveAttribute('data-unchecked');

    fireEvent.click(item());
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(item()).toHaveAttribute('aria-checked', 'true');
    expect(item()).toHaveAttribute('data-checked');
    expect(screen.getByTestId('indicator')).toHaveAttribute('data-checked');
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(item());
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(item()).toHaveAttribute('aria-checked', 'false');
  });

  it('when controlled, reports the change and shows what the parent passes', () => {
    const onCheckedChange = vi.fn();
    render(<View checked onCheckedChange={onCheckedChange} />);
    fireEvent.click(item());
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(item()).toHaveAttribute('aria-checked', 'true');
  });

  it('closes the menu with closeOnClick', () => {
    onOpenChange.mockClear();
    render(<View closeOnClick />);
    fireEvent.click(item());
    expect(item()).toHaveAttribute('aria-checked', 'true');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('does not toggle when disabled, or when the consumer prevents it', () => {
    const { unmount } = render(<View disabled />);
    fireEvent.click(item());
    expect(item()).toHaveAttribute('aria-checked', 'false');
    expect(item()).toBeDisabled();
    unmount();

    render(
      <View
        onClick={(event) => (event as ComponentEvent<typeof event>).preventComponentHandler()}
      />,
    );
    fireEvent.click(item());
    expect(item()).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Menu.RadioGroup', () => {
  function View(props: MenuRadioGroupProps & { sizeDisabled?: boolean }) {
    const { sizeDisabled, ...group } = props;
    return (
      <Menu.Root defaultOpen>
        <Menu.Popup>
          <Menu.RadioGroup data-testid="group" {...group}>
            <Menu.GroupLabel>Sort by</Menu.GroupLabel>
            <Menu.RadioItem value="name">Name</Menu.RadioItem>
            <Menu.RadioItem value="date">Date</Menu.RadioItem>
            <Menu.RadioItem value="size" disabled={sizeDisabled}>
              Size
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>
    );
  }
  const radio = (name: string) => screen.getByRole('menuitemradio', { name, hidden: true });

  it('is a group named by its label, checking one item at a time', () => {
    const onValueChange = vi.fn();
    render(<View defaultValue="name" onValueChange={onValueChange} />);
    const group = screen.getByRole('group', { name: 'Sort by', hidden: true });
    expect(group).toBe(screen.getByTestId('group'));
    expect(radio('Name')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Date')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(radio('Date'));
    expect(onValueChange).toHaveBeenLastCalledWith('date');
    expect(radio('Date')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Name')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(radio('Date'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('starts with none checked, and a disabled item cannot be checked', () => {
    render(<View sizeDisabled />);
    for (const name of ['Name', 'Date', 'Size']) {
      expect(radio(name)).toHaveAttribute('aria-checked', 'false');
    }
    fireEvent.click(radio('Size'));
    expect(radio('Size')).toHaveAttribute('aria-checked', 'false');
  });

  it('disables every item when the group is disabled', () => {
    render(<View disabled />);
    expect(screen.getByTestId('group')).toHaveAttribute('data-disabled');
    for (const name of ['Name', 'Date', 'Size']) {
      expect(radio(name)).toBeDisabled();
      expect(radio(name)).toHaveAttribute('data-disabled');
    }
  });
});

describe('Menu.Group', () => {
  it('is named by its GroupLabel only once there is one', () => {
    const { rerender } = render(
      <Menu.Root>
        <Menu.Group data-testid="group">
          <Menu.Item>Cut</Menu.Item>
        </Menu.Group>
      </Menu.Root>,
    );
    expect(screen.getByTestId('group')).toHaveAttribute('role', 'group');
    expect(screen.getByTestId('group')).not.toHaveAttribute('aria-labelledby');
    rerender(
      <Menu.Root>
        <Menu.Group data-testid="group">
          <Menu.GroupLabel>Edit</Menu.GroupLabel>
          <Menu.Item>Cut</Menu.Item>
        </Menu.Group>
      </Menu.Root>,
    );
    expect(screen.getByTestId('group')).toHaveAccessibleName('Edit');
  });
});
