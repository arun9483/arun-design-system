import { useMemo } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useRadioGroupRootContext, type RadioGroupItemState } from './RadioGroupRootContext';
import { radioGroupItemDataAttributes } from './radioGroupDataAttributes';

/**
 * RadioGroup.Item's own props. Everything else — `id`, `className`, `aria-*`, `data-*`,
 * event handlers — comes from React's own `<input>` props.
 *
 * `name`, `checked`, `defaultChecked`, `required` and `form` belong to the group and are
 * not accepted here: a radio's checkedness is the group's value, not its own. `type` is
 * always `radio`, and `children` is left out because an `<input>` cannot hold any.
 */
type RadioGroupItemOwnProps = {
  /** The group's value when this radio is selected, and what the form submits for it. */
  value: string;
  /** Disables this radio alone. A disabled group disables it regardless. */
  disabled?: boolean;
  /** Element to render instead of the default `<input type="radio">`. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type RadioGroupItemProps = RadioGroupItemOwnProps &
  Omit<
    ComponentPropsWithRef<'input'>,
    | keyof RadioGroupItemOwnProps
    | 'type'
    | 'name'
    | 'checked'
    | 'defaultChecked'
    | 'required'
    | 'form'
    | 'children'
  >;

/**
 * One radio — a native `<input type="radio">`.
 *
 * Void, so it has no parts: there is no indicator to hold, and the dot is drawn by CSS
 * off `:checked` or the `data-*` attributes. Decision 11 — one element, one component.
 *
 * It has no accessible name of its own — wrap it in a `<label>`, pair it with one by
 * `id`, or pass `aria-label`. A wrapping label names it natively, but
 * jsx-a11y/label-has-associated-control cannot see through this component to the input,
 * so under that rule pair it by `id` too.
 */
export function RadioGroupItem({
  value,
  disabled: disabledProp = false,
  className,
  render,
  ...rest
}: RadioGroupItemProps) {
  const group = useRadioGroupRootContext();
  const disabled = group.disabled || disabledProp;
  const checked = group.value === value;

  const state: RadioGroupItemState = useMemo(() => ({ checked, disabled }), [checked, disabled]);

  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      type: 'radio',
      name: group.name,
      value,
      // Controlled from the group's value, so React restores it after any change the
      // group declines — the platform never gets the last word on what is checked.
      checked,
      form: group.form,
      required: group.required || undefined,
      disabled: disabled || undefined,
      ...radioGroupItemDataAttributes(state),
      className,
      onChange() {
        // Guarded on state rather than trusting the native attribute: a `render`
        // element can drop or override `disabled`, but not the component's state.
        if (disabled) return;
        group.select(value);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
