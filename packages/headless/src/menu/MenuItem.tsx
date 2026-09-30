import { useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuRootContext } from './MenuRootContext';
import { menuItemDataAttributes } from './menuDataAttributes';

type MenuItemOwnProps = {
  /**
   * Cannot be activated. Skipped by the arrow keys, unless the Root sets
   * `focusableWhenDisabled`.
   */
  disabled?: boolean;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuItemProps = MenuItemOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenuItemOwnProps>;

/**
 * One action. A native `<button>`, so Enter, Space and a click activate it with no key
 * handling here: put the action in `onClick`. Activating it closes the menu — call
 * `event.preventComponentHandler()` in your `onClick` to keep it open.
 *
 * `tabIndex={-1}`: the menu moves focus between items itself, and Tab leaves the menu.
 *
 * Disabled, it is a native `disabled` button, out of focus and activation. With the Root's
 * `focusableWhenDisabled` it is `aria-disabled` instead, which keeps it focusable, so the
 * activation a native `disabled` would block is blocked here: your `onClick` is not
 * attached while it is disabled.
 */
export function MenuItem({
  disabled = false,
  onClick,
  className,
  children,
  render,
  ...rest
}: MenuItemProps) {
  const { setOpen, focusableWhenDisabled, register } = useMenuRootContext('Item');
  const elementRef = useRef<HTMLElement | null>(null);

  // Registered from props, so the Root knows the items without reading the DOM (decision 10).
  useLayoutEffect(() => register({ disabled, ref: elementRef }), [register, disabled]);

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      role: 'menuitem',
      tabIndex: -1,
      disabled: (disabled && !focusableWhenDisabled) || undefined,
      'aria-disabled': (disabled && focusableWhenDisabled) || undefined,
      ...menuItemDataAttributes(disabled),
      className,
      children,
      ref: elementRef,
      onClick() {
        // Guarded on state, not the attribute a `render` element might drop (decision 10).
        if (!disabled) setOpen(false);
      },
    },
    consumerProps: (disabled ? rest : { ...rest, onClick }) as UnknownProps,
  });
}
