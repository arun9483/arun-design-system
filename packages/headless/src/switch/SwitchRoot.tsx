import { useEffect, useMemo, useRef } from 'react';
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
   * It must render a native `<button>` — a wrapper such as `<Tooltip.Trigger />` that
   * forwards its props to one. Anything else is reported in development.
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

  const state: SwitchState = useMemo(() => ({ checked, disabled }), [checked, disabled]);
  const elementRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useNativeButtonWarning(elementRef);
  useFormReset({ elementRef, inputRef, checked, setChecked, onCheckedChange });

  const element = useRender({
    render,
    defaultTagName: 'button',
    props: {
      // Without this a switch inside a form would submit it on every toggle.
      type: 'button',
      role: 'switch',
      'aria-checked': checked,
      // The platform suppresses activation, focus and the click handler below.
      disabled: disabled || undefined,
      ...switchDataAttributes(state),
      className,
      children,
      ref: elementRef,
      onClick() {
        const next = !checked;
        setChecked(next);
        onCheckedChange?.(next);
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
  setChecked,
  onCheckedChange,
}: {
  elementRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  checked: boolean;
  setChecked: (next: boolean) => void;
  onCheckedChange: ((checked: boolean) => void) | undefined;
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
        setChecked(initialChecked);
        onCheckedChange?.(initialChecked);
      });
    }

    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [elementRef, inputRef, checked, setChecked, onCheckedChange, initialChecked]);
}

/**
 * Development-only check that `render` produced a native `<button>`.
 *
 * The component's correctness rests on that single fact, and it is the one thing a
 * `render` element can take away. Reporting it is cheaper than synthesising focus and
 * keyboard activation for elements nobody should be passing here.
 */
function useNativeButtonWarning(elementRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const element = elementRef.current;
    if (!element || element.tagName === 'BUTTON') return;

    console.error(
      `Switch.Root rendered <${element.tagName.toLowerCase()}> instead of <button>. ` +
        'Focus, Space and Enter activation and `disabled` all come from the button ' +
        'element; pass a `render` component that forwards its props to one.',
    );
  }, [elementRef]);
}
