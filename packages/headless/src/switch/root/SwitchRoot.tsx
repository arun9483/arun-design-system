import { cloneElement, useMemo } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { retractActivationProps, useButton } from '../../useButton';
import { useControlled } from '../../core/useControlled';
import { useRender } from '../../core/useRender';
import { SwitchRootContext, type SwitchState } from '../SwitchRootContext';
import { switchStateAttributes } from '../stateAttributes';

export interface SwitchRootProps {
  /**
   * Controlled state. Provide `onCheckedChange` alongside it.
   *
   * Never `undefined` once mounted. The mode is latched at mount, so an `undefined`
   * first render makes the switch uncontrolled for good and every value passed later
   * is ignored. Coalesce at the call site — `checked={x ?? false}`.
   */
  checked?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /**
   * Submits with the enclosing form when checked, mirroring a native checkbox:
   * an unchecked control contributes nothing.
   */
  name?: string;
  /** Value submitted when checked. Defaults to `"on"`, as a native checkbox does. */
  value?: string;
  className?: string;
  children?: ReactNode;
  /**
   * Element to render instead of the default `<button>`. Props, className, event
   * handlers and ref are merged onto it.
   */
  render?: ReactElement;
  ref?: Ref<HTMLElement>;
}

/**
 * A switch — an immediate on/off control, distinct from a checkbox in that it takes
 * effect at once rather than on submit.
 *
 * Renders a native `<button>`, which supplies focusability, Space and Enter
 * activation, and the disabled semantics for free. Per the WAI-ARIA switch pattern
 * it carries `role="switch"` and `aria-checked`.
 *
 * It has no accessible name of its own — wrap it in a `<label>`, or pass `aria-label`
 * or `aria-labelledby`. That is the consumer's decision, not something a headless
 * component should guess.
 */
export function SwitchRoot({
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  name,
  value = 'on',
  className,
  children,
  render,
  ...rest
}: SwitchRootProps & Record<string, unknown>) {
  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: defaultChecked ?? false,
    name: 'Switch.Root',
    state: 'checked',
  });

  const state: SwitchState = useMemo(() => ({ checked, disabled }), [checked, disabled]);

  // Only a real <button> is disabled by the platform. Rendered as anything else the
  // attribute is inert, so the state has to be synthesised — and the consumer's own
  // props sanitised, since they would otherwise still activate an inert control.
  const isNativeButton = render === undefined || render.type === 'button';
  const { props: consumerProps, ref: buttonRef } = useButton({
    disabled,
    native: isNativeButton,
    props: rest,
  });

  // A `render` element's own props merge last, so an href written directly on it
  // outranks anything useButton returns. Retract it on the element instead.
  const safeRender =
    disabled && !isNativeButton && render !== undefined
      ? cloneElement(render, retractActivationProps(render.props as Record<string, unknown>))
      : render;

  const element = useRender<SwitchState>({
    render: safeRender,
    defaultTagName: 'button',
    state,
    stateAttributes: switchStateAttributes,
    props: [
      {
        role: 'switch',
        'aria-checked': checked,
        className,
        children,
        onClick() {
          // A consumer's handlers are stripped by useButton when disabled; this guards
          // the component's own, which useButton does not see.
          if (disabled) return;
          const next = !checked;
          setChecked(next);
          onCheckedChange?.(next);
        },
      },
      consumerProps,
      { ref: buttonRef },
    ],
  });

  return (
    <SwitchRootContext.Provider value={state}>
      {element}
      {/* Native checkboxes submit only when checked; an unchecked switch contributes
          nothing, so a form sees the same shape it would from a checkbox. */}
      {name !== undefined && checked ? <input type="hidden" name={name} value={value} /> : null}
    </SwitchRootContext.Provider>
  );
}
