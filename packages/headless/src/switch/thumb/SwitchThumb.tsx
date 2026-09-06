import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../../core/useRender';
import type { UnknownProps } from '../../core/mergeProps';
import { useSwitchRootContext } from '../SwitchRootContext';
import { switchDataAttributes } from '../stateAttributes';

/**
 * Switch.Thumb's own props. Everything else — `id`, `className`, `children`, `aria-*`,
 * `data-*` — comes from React's own `<span>` props.
 */
type SwitchThumbOwnProps = {
  /** Element to render instead of the default `<span>`. */
  render?: ReactElement;
  /** Ref to the rendered element, whatever `render` makes it. */
  ref?: Ref<HTMLElement>;
};

export type SwitchThumbProps = SwitchThumbOwnProps &
  Omit<ComponentPropsWithRef<'span'>, keyof SwitchThumbOwnProps>;

/**
 * The moving part of the switch.
 *
 * Reads state from the Root rather than taking props, so a consumer cannot get the
 * two out of step. Carries the same `data-*` attributes as the Root, so it can be
 * styled from either — on the thumb itself, or by descending from the Root:
 *
 *   .thumb[data-checked] { transform: translateX(100%); }
 *   .switch[data-checked] .thumb { transform: translateX(100%); }
 *
 * Purely presentational — hidden from assistive technology, since the Root already
 * announces the state.
 */
export function SwitchThumb({ className, children, render, ...rest }: SwitchThumbProps) {
  const state = useSwitchRootContext();

  return useRender({
    render,
    defaultTagName: 'span',
    props: { 'aria-hidden': true, ...switchDataAttributes(state), className, children },
    consumerProps: rest as UnknownProps,
  });
}
