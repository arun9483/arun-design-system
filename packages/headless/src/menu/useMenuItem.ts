import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { isPointInPolygon, type Point } from '../core/pointerIntent';
import { textOf } from '../core/typeahead';
import { useMenuRootContext, type MenuRootContextValue } from './MenuRootContext';

/**
 * What every kind of item shares — Item, CheckboxItem, RadioItem: registering with the Root from
 * its props (decision 10), and the attributes that make it a menu item. Each kind adds its role
 * and what activating it does.
 *
 * `tabIndex={-1}`: the menu moves focus between items itself, and Tab leaves the menu. Disabled,
 * it is a native `disabled` button, out of focus and activation; with the Root's
 * `focusableWhenDisabled` it is `aria-disabled` instead, focusable, and the kind blocks its own
 * activation, the consumer's `onClick` included.
 */
export function useMenuItem(
  part: string,
  { disabled, textValue, children }: { disabled: boolean; textValue?: string; children: ReactNode },
  // A SubmenuTrigger sits in the menu its SubmenuRoot is nested in, and registers there.
  menu?: MenuRootContextValue,
) {
  const own = useMenuRootContext(part);
  const { closeAll, focusableWhenDisabled, register, openSubmenuRef, graceRef } = menu ?? own;
  const ref = useRef<HTMLElement | null>(null);
  const text = textValue ?? textOf(children);

  useLayoutEffect(() => register({ disabled, textValue: text, ref }), [register, disabled, text]);

  return {
    closeAll,
    itemProps: {
      type: 'button',
      tabIndex: -1,
      disabled: (disabled && !focusableWhenDisabled) || undefined,
      'aria-disabled': (disabled && focusableWhenDisabled) || undefined,
      'data-disabled': disabled ? '' : undefined,
      ref,
      onPointerMove(event: ReactPointerEvent) {
        // Moving onto another item closes the open submenu — unless the pointer is on its way
        // there, across the grace area its trigger left.
        if (event.pointerType !== 'mouse' || !openSubmenuRef.current) return;
        if (isInGrace(graceRef.current, event)) return;
        openSubmenuRef.current.close();
      },
    },
  };
}

/** Whether a pointer event falls inside a grace area that has not yet run out. */
export function isInGrace(
  grace: { area: Point[]; until: number } | null,
  event: { clientX: number; clientY: number },
): boolean {
  if (!grace || performance.now() > grace.until) return false;
  return isPointInPolygon({ x: event.clientX, y: event.clientY }, grace.area);
}

/** A checkable item's state, for its ItemIndicator. */
export type MenuItemIndicatorState = { checked: boolean; disabled: boolean };

export const MenuItemIndicatorContext = createContext<MenuItemIndicatorState | null>(null);

export function useMenuItemIndicatorContext(): MenuItemIndicatorState {
  const context = useContext(MenuItemIndicatorContext);
  if (context === null) {
    throw new Error(
      '<Menu.ItemIndicator> must be rendered inside <Menu.CheckboxItem> or <Menu.RadioItem>.',
    );
  }
  return context;
}

/** On a CheckboxItem, a RadioItem and an ItemIndicator, as Checkbox's: one per state. */
export function menuCheckableDataAttributes({ checked, disabled }: MenuItemIndicatorState) {
  return {
    'data-checked': checked ? '' : undefined,
    'data-unchecked': checked ? undefined : '',
    'data-disabled': disabled ? '' : undefined,
  };
}
