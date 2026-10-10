'use client';

import { useCallback, useMemo } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useControlled } from '../core/useControlled';
import { RovingGroupContext, useRovingGroup, useRovingGroupContext } from '../core/rovingGroup';
import type { Orientation } from '../core/rovingFocus';
import { ToggleGroupContext } from './ToggleGroupContext';

type ToggleGroupOwnProps = {
  /** Controlled: the pressed Toggles' values. Provide `onValueChange` alongside it. */
  value?: readonly string[];
  /** Initial value when uncontrolled. Read once, at mount. */
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  /** Lets more than one Toggle be pressed. Without it, pressing one releases the others. */
  multiple?: boolean;
  /** Disables every Toggle in it. */
  disabled?: boolean;
  /** Which arrow keys move between the Toggles. */
  orientation?: Orientation;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

/** The fallback default: one array, so a re-render does not read as a changed default. */
const NONE: readonly string[] = [];

export type ToggleGroupProps = ToggleGroupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ToggleGroupOwnProps>;

/**
 * Toggles that share one value (decision 17): `role="group"`, one Tab stop — the pressed Toggle,
 * or the first — and the arrow keys between them. Pressing the pressed Toggle releases it, so the
 * value may be empty. Inside a Toolbar its Toggles join the Toolbar's arrow keys instead. Name it
 * with `aria-label`.
 */
export function ToggleGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  disabled = false,
  orientation = 'horizontal',
  className,
  children,
  render,
  ...rest
}: ToggleGroupProps) {
  const [value, setValueState] = useControlled<readonly string[]>({
    controlled: valueProp,
    default: defaultValue ?? NONE,
    name: 'ToggleGroup',
    state: 'value',
  });

  const toggle = useCallback(
    (item: string) => {
      const pressed = value.includes(item);
      const next = multiple
        ? pressed
          ? value.filter((v) => v !== item)
          : [...value, item]
        : pressed
          ? []
          : [item];
      setValueState(next);
      onValueChange?.(next);
    },
    [value, multiple, setValueState, onValueChange],
  );

  const outer = useRovingGroupContext();
  // The first Tab stop is the pressed Toggle, as a radio group's is the checked radio.
  const roving = useRovingGroup({ orientation });

  const context = useMemo(() => ({ value, disabled, toggle }), [value, disabled, toggle]);

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      'data-orientation': orientation,
      'data-disabled': disabled ? '' : undefined,
      className,
      children,
      // In a Toolbar, the Toolbar moves focus.
      onKeyDown: outer ? undefined : roving.onKeyDown,
    },
    consumerProps: rest as UnknownProps,
  });

  return (
    <ToggleGroupContext.Provider value={context}>
      {outer ? (
        element
      ) : (
        <RovingGroupContext.Provider value={roving.context}>{element}</RovingGroupContext.Provider>
      )}
    </ToggleGroupContext.Provider>
  );
}
