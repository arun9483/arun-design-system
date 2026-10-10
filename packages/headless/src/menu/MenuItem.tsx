'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuItem } from './useMenuItem';

type MenuItemOwnProps = {
  /**
   * Cannot be activated. Skipped by the arrow keys, unless the Root sets
   * `focusableWhenDisabled`.
   */
  disabled?: boolean;
  /**
   * The text typeahead matches. Defaults to the text in `children`; set it when that text is
   * rendered by a component of your own, or differs from what should be typed.
   */
  textValue?: string;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuItemProps = MenuItemOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenuItemOwnProps>;

/**
 * One action. A native `<button>`, so Enter, Space and a click activate it with no key
 * handling here: put the action in `onClick`. Activating it closes the menu, and every menu
 * it is nested in — call `event.preventComponentHandler()` in your `onClick` to keep it open.
 *
 * Disabled, your `onClick` is not attached, so an `aria-disabled` item under the Root's
 * `focusableWhenDisabled` cannot run it either.
 */
export function MenuItem({
  disabled = false,
  textValue,
  onClick,
  className,
  children,
  render,
  ...rest
}: MenuItemProps) {
  const { closeAll, itemProps } = useMenuItem('Item', { disabled, textValue, children });

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...itemProps,
      role: 'menuitem',
      className,
      children,
      onClick() {
        // Guarded on state, not the attribute a `render` element might drop (decision 10).
        if (!disabled) closeAll();
      },
    },
    consumerProps: (disabled ? rest : { ...rest, onClick }) as UnknownProps,
  });
}
