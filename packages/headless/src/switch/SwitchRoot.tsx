import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref, RefObject } from 'react';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { SwitchRootContext, type SwitchState } from './SwitchRootContext';
import { switchDataAttributes } from './switchDataAttributes';

/**
 * Switch.Root's own props. Everything else — `id`, `className`, `children`, `aria-*`,
 * `data-*`, event handlers — comes from React's own `<button>` props, so it is typed
 * and checked without being declared here.
 *
 * `id` in particular is how a switch gets an accessible name, paired with a
 * `<label htmlFor>`. A wrapping `<label>` names the rendered `<button>` too, but
 * `jsx-a11y/label-has-associated-control` rejects a button as a nested control, so the
 * explicit pairing is the one that passes lint.
 */
type SwitchRootOwnProps = {
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
   * an unchecked or disabled control contributes nothing.
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

export type SwitchRootProps = SwitchRootOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof SwitchRootOwnProps>;

/**
 * A switch — an immediate on/off control, distinct from a checkbox in that it takes
 * effect at once rather than on submit.
 *
 * Always a native `<button>`, which is the whole reason this component is short: the
 * platform supplies focusability, Space and Enter activation, and `disabled`, so none
 * of it is synthesised here. Per the WAI-ARIA switch pattern it carries `role="switch"`
 * and `aria-checked`.
 *
 * Inside a form it behaves as a checkbox would there: `form.reset()` returns it to the
 * state it mounted with. The change is reported through `onCheckedChange`, so a
 * controlled switch moves only if its parent accepts it.
 *
 * It has no accessible name of its own — pair it with a `<label htmlFor>` by `id`, or
 * pass `aria-label` or `aria-labelledby`. That is the consumer's decision, not one a
 * headless component should guess.
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
}: SwitchRootProps) {
  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: defaultChecked ?? false,
    name: 'Switch.Root',
    state: 'checked',
  });

  // The one path every change takes — click and form reset alike — so the state and
  // the report of it cannot drift apart.
  const commitChecked = useCallback(
    (next: boolean) => {
      setChecked(next);
      onCheckedChange?.(next);
    },
    [setChecked, onCheckedChange],
  );

  const state: SwitchState = useMemo(() => ({ checked, disabled }), [checked, disabled]);
  const elementRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useFormReset({ elementRef, inputRef, checked, commitChecked });

  const element = useRender({
    render,
    defaultTagName: 'button',
    props: {
      // Without this a switch inside a form would submit it on every toggle.
      type: 'button',
      role: 'switch',
      'aria-checked': checked,
      // The platform suppresses activation and focus on a native button.
      disabled: disabled || undefined,
      ...switchDataAttributes(state),
      className,
      children,
      ref: elementRef,
      onClick() {
        // Guarded on state rather than trusting the native attribute: a `render`
        // element can drop or override `disabled`, but not the component's state.
        if (disabled) return;
        commitChecked(!checked);
      },
    },
    consumerProps: rest as UnknownProps,
  });

  return (
    <SwitchRootContext.Provider value={state}>
      {element}
      {/* Native checkboxes submit only when checked and enabled; the hidden input does
          the same, so a form sees the shape it would from a checkbox. A real checkbox
          rather than type="hidden", so it is listed in `form.elements`. */}
      {name !== undefined ? (
        <input
          ref={inputRef}
          type="checkbox"
          hidden
          readOnly
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
        />
      ) : null}
    </SwitchRootContext.Provider>
  );
}

/**
 * Returns the switch to the state it mounted with when its form is reset.
 *
 * The platform resets the hidden checkbox by itself, but knows nothing of the React
 * state behind `aria-checked` and the `data-*` attributes — without this, a reset form
 * shows one value and submits another. React writes the mount-time `checked` as the
 * input's default, so "the state it mounted with" is exactly what the platform resets
 * the input to.
 *
 * `reset` fires before the form resets, and a listener that runs after this one can
 * still cancel it, so the work waits for a microtask, when dispatch has finished.
 */
function useFormReset({
  elementRef,
  inputRef,
  checked,
  commitChecked,
}: {
  elementRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  checked: boolean;
  commitChecked: (next: boolean) => void;
}) {
  const { current: initialChecked } = useRef(checked);

  useEffect(() => {
    // `.form` also honours a `form="id"` attribute on the button.
    const form = (elementRef.current as HTMLButtonElement | null)?.form;
    if (!form) return;

    function onReset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        // Undo the platform's reset of the input: it follows the switch, and only moves
        // when the state below does — which a controlled parent may decline.
        if (inputRef.current) inputRef.current.checked = checked;
        if (checked === initialChecked) return;
        commitChecked(initialChecked);
      });
    }

    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [elementRef, inputRef, checked, commitChecked, initialChecked]);
}
