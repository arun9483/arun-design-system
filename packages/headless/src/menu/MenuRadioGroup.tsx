'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useControlled } from '../core/useControlled';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuGroupElement } from './MenuGroup';

type MenuRadioGroupOwnProps = {
  /**
   * Controlled value — the `value` of the checked RadioItem, or `null` for none. Provide
   * `onValueChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for RadioGroup.
   */
  value?: string | null;
  /** Initial value when uncontrolled. Read once, at mount. */
  defaultValue?: string | null;
  /** Called with the value of the RadioItem being checked, in both modes. */
  onValueChange?: (value: string) => void;
  /** Disables every RadioItem inside. */
  disabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuRadioGroupProps = MenuRadioGroupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof MenuRadioGroupOwnProps | 'defaultValue'>;

type MenuRadioGroupContextValue = {
  value: string | null;
  disabled: boolean;
  select: (value: string) => void;
};

const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

export function useMenuRadioGroupContext(): MenuRadioGroupContextValue {
  const context = useContext(MenuRadioGroupContext);
  if (context === null) {
    throw new Error('<Menu.RadioItem> must be rendered inside <Menu.RadioGroup>.');
  }
  return context;
}

/**
 * One choice among several: a `role="group"` that owns a value, and the RadioItems inside
 * derive `checked` from it — as RadioGroup does for radios. Named by a GroupLabel inside, as a
 * Group is.
 */
export function MenuRadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
  render,
  ...rest
}: MenuRadioGroupProps) {
  const [value, setValue] = useControlled<string | null>({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: 'Menu.RadioGroup',
    state: 'value',
  });

  // The one path every change takes; checking the checked item again changes nothing.
  const select = useCallback(
    (next: string) => {
      if (next === value) return;
      setValue(next);
      onValueChange?.(next);
    },
    [value, setValue, onValueChange],
  );
  const context = useMemo(() => ({ value, disabled, select }), [value, disabled, select]);

  const element = useMenuGroupElement('RadioGroup', {
    render,
    props: { 'data-disabled': disabled ? '' : undefined, className, children },
    consumerProps: rest as UnknownProps,
  });

  return <MenuRadioGroupContext.Provider value={context}>{element}</MenuRadioGroupContext.Provider>;
}
