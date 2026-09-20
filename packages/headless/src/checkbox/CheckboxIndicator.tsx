import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useCheckboxRootContext } from './CheckboxRootContext';
import { checkboxDataAttributes } from './checkboxDataAttributes';

/**
 * Checkbox.Indicator's own props. Everything else — `id`, `className`, `children`,
 * `aria-*`, `data-*` — comes from React's own `<span>` props.
 */
type CheckboxIndicatorOwnProps = {
  /** Element to render instead of the default `<span>`. */
  render?: ReactElement;
  /** Ref to the rendered element, whatever `render` makes it. */
  ref?: Ref<HTMLElement>;
};

export type CheckboxIndicatorProps = CheckboxIndicatorOwnProps &
  Omit<ComponentPropsWithRef<'span'>, keyof CheckboxIndicatorOwnProps>;

/**
 * Where the check or the dash goes.
 *
 * Ships neither — like every part here it has no glyph, no class and no colour, so a
 * bare `<Checkbox.Indicator />` renders an empty `<span>`. Supply the mark as children,
 * or draw it in your own CSS off the `data-*` attributes below. `@arun-dev/ui` is the
 * layer that has an opinion about what a checkmark looks like.
 *
 * Reads state from the Root rather than taking props, so a consumer cannot get the two
 * out of step. Carries the same `data-*` attributes as the Root, so it can be styled
 * from either — on the indicator itself, or by descending from the Root:
 *
 *   .indicator[data-checked] { opacity: 1; }
 *   .checkbox[data-checked] .indicator { opacity: 1; }
 *
 * Always rendered, in every state. The alternative — unmounting it when unchecked —
 * would leave nothing for CSS to transition from, and nothing to hold an unchecked
 * mark for the designs that want one.
 *
 * Purely presentational — hidden from assistive technology, since the Root already
 * announces the state.
 */
export function CheckboxIndicator({
  className,
  children,
  render,
  ...rest
}: CheckboxIndicatorProps) {
  const state = useCheckboxRootContext();

  return useRender({
    render,
    defaultTagName: 'span',
    props: { 'aria-hidden': true, ...checkboxDataAttributes(state), className, children },
    consumerProps: rest as UnknownProps,
  });
}
