import { useCallback, useMemo, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useControlled } from '../core/useControlled';
import { useFormReset } from '../core/useFormReset';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { CheckboxRootContext, type CheckboxState, type CheckedState } from './CheckboxRootContext';
import { checkboxDataAttributes } from './checkboxDataAttributes';

/**
 * Checkbox.Root's own props. Everything else — `id`, `className`, `children`, `aria-*`,
 * `data-*`, event handlers — comes from React's own `<button>` props, so it is typed
 * and checked without being declared here.
 *
 * `id` in particular is how a checkbox gets an accessible name, paired with a
 * `<label htmlFor>`. A wrapping `<label>` names the rendered `<button>` too, but
 * `jsx-a11y/label-has-associated-control` rejects a button as a nested control, so the
 * explicit pairing is the one that passes lint.
 */
type CheckboxRootOwnProps = {
  /**
   * Controlled state. Provide `onCheckedChange` alongside it.
   *
   * Never `undefined` once mounted. The mode is latched at mount, so an `undefined`
   * first render makes the checkbox uncontrolled for good and every value passed later
   * is ignored. Coalesce at the call site — `checked={x ?? false}`.
   */
  checked?: CheckedState;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
  /**
   * Submits with the enclosing form when checked, mirroring a native checkbox:
   * an unchecked, indeterminate or disabled control contributes nothing.
   */
  name?: string;
  /** Value submitted when checked. Defaults to `"on"`, as a native checkbox does. */
  value?: string;
  /**
   * Component to render instead of the default `<button>`. Props, className, event
   * handlers and ref are merged onto it.
   *
   * The default `<button>` is what supplies focus, Space and Enter activation and
   * `disabled`; what `render` produces instead is the consumer's choice.
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type CheckboxRootProps = CheckboxRootOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof CheckboxRootOwnProps>;

/**
 * A checkbox — a three-state control whose value is read on submit, distinct from a
 * switch in that it does not take effect at once.
 *
 * A `<button role="checkbox">` rather than an `<input type="checkbox">`, because an
 * input is void and cannot hold an indicator — the content test in decision 7, the same
 * one Switch.Root fails. Everything the input was still good for, the hidden one below
 * keeps doing. The platform supplies focusability, Space and Enter activation and
 * `disabled`, so none of it is synthesised here.
 *
 * Inside a form it behaves as a native checkbox would: `form.reset()` returns it to the
 * state it mounted with, indeterminate included — which a native checkbox does not
 * manage, since `.indeterminate` is a DOM property the platform never resets.
 *
 * It has no accessible name of its own — pair it with a `<label htmlFor>` by `id`, or
 * pass `aria-label` or `aria-labelledby`. That is the consumer's decision, not one a
 * headless component should guess.
 */
export function CheckboxRoot({
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
}: CheckboxRootProps) {
  const [checked, setChecked] = useControlled<CheckedState>({
    controlled: checkedProp,
    default: defaultChecked ?? false,
    name: 'Checkbox.Root',
    state: 'checked',
  });

  // The one path every change takes — click and form reset alike — so the state and
  // the report of it cannot drift apart.
  const commitChecked = useCallback(
    (next: CheckedState) => {
      setChecked(next);
      onCheckedChange?.(next);
    },
    [setChecked, onCheckedChange],
  );

  const state: CheckboxState = useMemo(() => ({ checked, disabled }), [checked, disabled]);
  const elementRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Indeterminate is a state to resolve, not one to cycle back through: only `true`
  // clears, so a mixed checkbox becomes checked, as a native one does.
  const submitted = checked === true;

  useFormReset({
    elementRef,
    inputRef,
    value: checked,
    inputChecked: submitted,
    commit: commitChecked,
  });

  const element = useRender({
    render,
    defaultTagName: 'button',
    props: {
      // Without this a checkbox inside a form would submit it on every toggle.
      type: 'button',
      role: 'checkbox',
      // The ARIA spelling of the third state is "mixed", not "indeterminate".
      'aria-checked': checked === 'indeterminate' ? 'mixed' : checked,
      // The platform suppresses activation and focus on a native button.
      disabled: disabled || undefined,
      ...checkboxDataAttributes(state),
      className,
      children,
      ref: elementRef,
      onClick() {
        // Guarded on state rather than trusting the native attribute: a `render`
        // element can drop or override `disabled`, but not the component's state.
        if (disabled) return;
        commitChecked(!submitted);
      },
    },
    consumerProps: rest as UnknownProps,
  });

  return (
    <CheckboxRootContext.Provider value={state}>
      {element}
      {/* Native checkboxes submit only when checked and enabled; the hidden input does
          the same, so a form sees the shape it would from a checkbox. Indeterminate
          submits nothing, because a native checkbox submits on checkedness alone and
          `.indeterminate` never changes it. A real checkbox rather than type="hidden",
          so it is listed in `form.elements`. */}
      {name !== undefined ? (
        <input
          ref={inputRef}
          type="checkbox"
          hidden
          readOnly
          name={name}
          value={value}
          checked={submitted}
          disabled={disabled}
        />
      ) : null}
    </CheckboxRootContext.Provider>
  );
}
