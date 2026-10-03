import { useMemo } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { MenuItemIndicatorContext, menuCheckableDataAttributes, useMenuItem } from './useMenuItem';

type MenuCheckboxItemOwnProps = {
  /**
   * Controlled state. Provide `onCheckedChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Checkbox.
   */
  checked?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultChecked?: boolean;
  /** Called with the new state, in both controlled and uncontrolled modes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Closes the menu when activated. Off by default: a setting is often changed with others. */
  closeOnClick?: boolean;
  /**
   * Cannot be activated. Skipped by the arrow keys, unless the Root sets
   * `focusableWhenDisabled`.
   */
  disabled?: boolean;
  /** The text typeahead matches. Defaults to the text in `children`. */
  textValue?: string;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuCheckboxItemProps = MenuCheckboxItemOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenuCheckboxItemOwnProps>;

/**
 * A setting that is on or off: `role="menuitemcheckbox"` with `aria-checked`, on a native
 * `<button>`. Activating it toggles the state and leaves the menu open, unless `closeOnClick`.
 * Your `onClick` runs first; `event.preventComponentHandler()` there stops the toggle.
 *
 * Holds its own state through `useControlled`; an ItemIndicator inside reads it.
 */
export function MenuCheckboxItem({
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  closeOnClick = false,
  disabled = false,
  textValue,
  onClick,
  className,
  children,
  render,
  ...rest
}: MenuCheckboxItemProps) {
  const { setOpen, itemProps } = useMenuItem('CheckboxItem', { disabled, textValue, children });
  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: defaultChecked ?? false,
    name: 'Menu.CheckboxItem',
    state: 'checked',
  });
  const state = useMemo(() => ({ checked, disabled }), [checked, disabled]);

  const element = useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...itemProps,
      role: 'menuitemcheckbox',
      'aria-checked': checked,
      ...menuCheckableDataAttributes(state),
      className,
      children,
      onClick() {
        if (disabled) return;
        setChecked(!checked);
        onCheckedChange?.(!checked);
        if (closeOnClick) setOpen(false);
      },
    },
    consumerProps: (disabled ? rest : { ...rest, onClick }) as UnknownProps,
  });

  return (
    <MenuItemIndicatorContext.Provider value={state}>{element}</MenuItemIndicatorContext.Provider>
  );
}
