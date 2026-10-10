'use client';

import { useRef } from 'react';
import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useControlled } from '../core/useControlled';
import { useRovingItem } from '../core/rovingGroup';
import { useToggleGroupContext } from '../toggle-group/ToggleGroupContext';

type ToggleOwnProps = {
  /** Controlled state. Provide `onPressedChange` alongside it. Ignored inside a ToggleGroup. */
  pressed?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Its value in a ToggleGroup: pressed while the group's `value` holds it. */
  value?: string;
  disabled?: boolean;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToggleProps = ToggleOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ToggleOwnProps>;

/**
 * A button that stays pressed: `<button aria-pressed>` (decision 17), as APG's toggle button.
 * Inside a ToggleGroup its state is the group's, by `value`; inside a Toolbar or a ToggleGroup it
 * is one of the arrow-key items. `data-pressed` while pressed.
 */
export function Toggle({
  pressed: pressedProp,
  defaultPressed,
  onPressedChange,
  value,
  disabled: disabledProp = false,
  className,
  children,
  render,
  ...rest
}: ToggleProps) {
  const group = useToggleGroupContext();
  const [ownPressed, setOwnPressed] = useControlled<boolean>({
    controlled: group ? undefined : pressedProp,
    default: defaultPressed ?? false,
    name: 'Toggle',
    state: 'pressed',
  });
  const pressed = group && value !== undefined ? group.value.includes(value) : ownPressed;
  const disabled = disabledProp || (group?.disabled ?? false);

  const elementRef = useRef<HTMLElement | null>(null);
  const roving = useRovingItem(elementRef, disabled, pressed);

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      'aria-pressed': pressed,
      disabled: disabled || undefined,
      'data-pressed': pressed ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      tabIndex: roving.tabIndex,
      className,
      children,
      ref: elementRef,
      onFocus: roving.onFocus,
      onClick(event: ReactMouseEvent) {
        // Guarded on state, not an attribute a `render` element might drop (decision 10).
        if (disabled || event.defaultPrevented) return;
        if (group && value !== undefined) {
          group.toggle(value);
          return;
        }
        setOwnPressed(!pressed);
        onPressedChange?.(!pressed);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
