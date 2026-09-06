import { useEffect, useMemo, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
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
 * `<label htmlFor>`: the rendered `<button>` is not named implicitly by a wrapping
 * `<label>`, and `jsx-a11y/label-has-associated-control` rejects it as a nested control.
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
   * an unchecked control contributes nothing.
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
  const elementRef = useNativeButtonWarning();

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
      {/* Native checkboxes submit only when checked; an unchecked switch contributes
          nothing, so a form sees the same shape it would from a checkbox. A real
          checkbox rather than a hidden input, so `form.reset()` and `form.elements`
          behave as they would for one. */}
      {name !== undefined ? (
        <input type="checkbox" hidden readOnly name={name} value={value} checked={checked} />
      ) : null}
    </SwitchRootContext.Provider>
  );
}

/**
 * Development-only check that `render` produced a native `<button>`.
 *
 * The component's correctness rests on that single fact, and it is the one thing a
 * `render` element can take away. Reporting it is cheaper than synthesising focus and
 * keyboard activation for elements nobody should be passing here.
 */
function useNativeButtonWarning(): Ref<HTMLElement> {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const element = elementRef.current;
    if (!element || element.tagName === 'BUTTON') return;

    console.error(
      `Switch.Root rendered <${element.tagName.toLowerCase()}> instead of <button>. ` +
        'Focus, Space and Enter activation and `disabled` all come from the button ' +
        'element; pass a `render` component that forwards its props to one.',
    );
  }, []);

  return elementRef;
}
