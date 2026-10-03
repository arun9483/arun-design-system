import { useMemo } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuRadioGroupContext } from './MenuRadioGroup';
import { MenuItemIndicatorContext, menuCheckableDataAttributes, useMenuItem } from './useMenuItem';

type MenuRadioItemOwnProps = {
  /** This item's value in its RadioGroup. Checked while the group's `value` equals it. */
  value: string;
  /** Closes the menu when activated. Off by default, as for CheckboxItem. */
  closeOnClick?: boolean;
  /**
   * Cannot be activated. Skipped by the arrow keys, unless the Root sets
   * `focusableWhenDisabled`. The RadioGroup's `disabled` disables it too.
   */
  disabled?: boolean;
  /** The text typeahead matches. Defaults to the text in `children`. */
  textValue?: string;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuRadioItemProps = MenuRadioItemOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenuRadioItemOwnProps>;

/**
 * One choice in a RadioGroup: `role="menuitemradio"` with `aria-checked`, on a native
 * `<button>`. Activating it checks it and leaves the menu open, unless `closeOnClick`; the
 * checked item stays checked when activated again. Your `onClick` runs first;
 * `event.preventComponentHandler()` there stops the change.
 */
export function MenuRadioItem({
  value,
  closeOnClick = false,
  disabled: disabledProp = false,
  textValue,
  onClick,
  className,
  children,
  render,
  ...rest
}: MenuRadioItemProps) {
  const group = useMenuRadioGroupContext();
  const disabled = disabledProp || group.disabled;
  const { setOpen, itemProps } = useMenuItem('RadioItem', { disabled, textValue, children });
  const checked = group.value === value;
  const state = useMemo(() => ({ checked, disabled }), [checked, disabled]);

  const element = useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...itemProps,
      role: 'menuitemradio',
      'aria-checked': checked,
      ...menuCheckableDataAttributes(state),
      className,
      children,
      onClick() {
        if (disabled) return;
        group.select(value);
        if (closeOnClick) setOpen(false);
      },
    },
    consumerProps: (disabled ? rest : { ...rest, onClick }) as UnknownProps,
  });

  return (
    <MenuItemIndicatorContext.Provider value={state}>{element}</MenuItemIndicatorContext.Provider>
  );
}
