import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { RadioGroupRootContext, type RadioGroupState } from './RadioGroupRootContext';
import { radioGroupDataAttributes } from './radioGroupDataAttributes';

/**
 * RadioGroup.Root's own props. Everything else — `id`, `className`, `children`,
 * `aria-*`, `data-*`, event handlers — comes from React's own `<div>` props.
 *
 * `aria-labelledby` in particular is how a group gets its accessible name, pointing at
 * the visible caption. A `<fieldset>` with a `<legend>` does the same through `render`.
 */
type RadioGroupRootOwnProps = {
  /**
   * Controlled value — the `value` of the selected item, or `null` for none. Provide
   * `onValueChange` alongside it.
   *
   * Never `undefined` once mounted. The mode is latched at mount, so an `undefined`
   * first render makes the group uncontrolled for good. Use `null` for "nothing
   * selected" — `value={x ?? null}`.
   */
  value?: string | null;
  /** Initial value when uncontrolled. Read once, at mount. */
  defaultValue?: string | null;
  /**
   * Called with the value being moved to, in both controlled and uncontrolled modes.
   * A user can only move to a value; `null` arrives only from `form.reset()` returning
   * a group that mounted with nothing selected.
   */
  onValueChange?: (value: string | null) => void;
  /**
   * The name every radio in the group shares, and submits under.
   *
   * The platform groups radios by name — that is what makes arrow keys move between
   * them and keeps one checked at a time — so one is generated when this is omitted.
   * A generated name still submits: pass your own when the group is inside a form.
   */
  name?: string;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Blocks form submission until a radio is selected, via the platform's validation. */
  required?: boolean;
  /** Associates the radios with a `<form>` by id, when the group is rendered outside it. */
  form?: string;
  /**
   * Component to render instead of the default `<div>` — a `<fieldset>`, say. Props,
   * className, event handlers and ref are merged onto it.
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type RadioGroupRootProps = RadioGroupRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof RadioGroupRootOwnProps>;

/** The radios this group renders, found by the name that groups them. */
function radiosIn(root: HTMLElement | null, name: string): HTMLInputElement[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter(
    (input) => input.name === name,
  );
}

/**
 * A set of radios, of which at most one is selected.
 *
 * The radios are native `<input type="radio">` elements — the native element passes all
 * three of decision 7's tests, so nothing here rebuilds what the platform already does.
 * Arrow keys move the selection, Tab enters the group at the checked radio, `required`
 * blocks submission and the form submits the checked value, all without JavaScript.
 *
 * What the group adds is the one thing the platform leaves to the page: a single value
 * in React. It owns that value, and every radio derives `checked` from it.
 *
 * Inside a form, `form.reset()` returns the group to the value it mounted with. The
 * platform resets the inputs by itself, but React's value would not follow — the same
 * seam `useFormReset` closes for Checkbox and Switch, closed here for a group.
 */
export function RadioGroupRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  name: nameProp,
  disabled = false,
  required = false,
  form,
  className,
  children,
  render,
  ...rest
}: RadioGroupRootProps) {
  const [value, setValue] = useControlled<string | null>({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: 'RadioGroup.Root',
    state: 'value',
  });

  const generatedName = useId();
  const name = nameProp ?? generatedName;

  // The one path every change takes — a radio's change and form reset alike — so the
  // state and the report of it cannot drift apart.
  const commitValue = useCallback(
    (next: string | null) => {
      setValue(next);
      onValueChange?.(next);
    },
    [setValue, onValueChange],
  );

  const elementRef = useRef<HTMLElement | null>(null);
  const { current: initialValue } = useRef(value);

  useEffect(() => {
    // `.form` honours a `form="id"` attribute, which a lookup by ancestor would not.
    const owner = radiosIn(elementRef.current, name)[0]?.form;
    if (!owner) return;

    function onReset(event: Event) {
      // `reset` fires before the form resets, and a later listener can still cancel it,
      // so the work waits until dispatch has finished.
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        // Undo the platform's reset of the inputs: they follow the group, and only move
        // when the value below does — which a controlled parent may decline.
        for (const input of radiosIn(elementRef.current, name)) {
          input.checked = input.value === value;
        }
        if (value === initialValue) return;
        commitValue(initialValue);
      });
    }

    owner.addEventListener('reset', onReset);
    return () => owner.removeEventListener('reset', onReset);
  }, [name, value, commitValue, initialValue]);

  const state: RadioGroupState = useMemo(
    () => ({ value, disabled, required, name, form, select: commitValue }),
    [value, disabled, required, name, form, commitValue],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'radiogroup',
      'aria-disabled': disabled || undefined,
      'aria-required': required || undefined,
      ...radioGroupDataAttributes(state),
      className,
      children,
      ref: elementRef,
    },
    consumerProps: rest as UnknownProps,
  });

  return <RadioGroupRootContext.Provider value={state}>{element}</RadioGroupRootContext.Provider>;
}
