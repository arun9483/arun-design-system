import { useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useTabsRootContext } from './TabsRootContext';
import { selectedDataAttributes } from './tabsDataAttributes';

type TabsTabOwnProps = {
  /** Identifies this tab, and the Panel with the same `value`. */
  value: string;
  /**
   * Cannot be selected. Skipped by the arrow keys, unless the Root sets
   * `focusableWhenDisabled` with `activationMode="manual"`.
   */
  disabled?: boolean;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TabsTabProps = TabsTabOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof TabsTabOwnProps | 'value'>;

/**
 * One tab. A native `<button>`, so Enter, Space and a click select it with no key handling
 * here. Only the tab holding the group's Tab stop has `tabIndex={0}` — roving tabindex — so
 * Tab enters the list at the selected tab and leaves it after one press.
 *
 * With `activationMode="automatic"` (the default) focus selects: the arrow keys change the
 * panel as they move. With `"manual"` they only move focus.
 */
export function TabsTab({
  value,
  disabled = false,
  onClick,
  className,
  children,
  render,
  ...rest
}: TabsTabProps) {
  const {
    value: selectedValue,
    setValue,
    activationMode,
    focusableWhenDisabled,
    tabStopValue,
    register,
    tabId,
    panelId,
  } = useTabsRootContext('Tab');
  const elementRef = useRef<HTMLElement | null>(null);
  const selected = value === selectedValue;

  // Registered from props, so the Root knows the tabs without reading the DOM (decision 10).
  useLayoutEffect(
    () => register({ value, disabled, ref: elementRef }),
    [register, value, disabled],
  );

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      role: 'tab',
      id: tabId(value),
      'aria-selected': selected,
      'aria-controls': panelId(value),
      tabIndex: value === tabStopValue ? 0 : -1,
      // The platform keeps a disabled button out of focus and activation. Focusable when
      // disabled, it is aria-disabled instead, and activation is blocked here.
      disabled: (disabled && !focusableWhenDisabled) || undefined,
      'aria-disabled': (disabled && focusableWhenDisabled) || undefined,
      ...selectedDataAttributes(selected, disabled),
      className,
      children,
      ref: elementRef,
      onClick() {
        // Guarded on state, not the attribute a `render` element might drop (decision 10).
        if (!disabled) setValue(value);
      },
      onFocus() {
        if (activationMode === 'automatic' && !disabled) setValue(value);
      },
    },
    // A native `disabled` would block your onClick; aria-disabled does not, so it is left off.
    consumerProps: (disabled ? rest : { ...rest, onClick }) as UnknownProps,
  });
}
