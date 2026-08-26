import type { ReactElement, ReactNode, Ref } from 'react';
import { useRender } from '../../core/useRender';
import { useSwitchRootContext, type SwitchState } from '../SwitchRootContext';
import { switchStateAttributes } from '../stateAttributes';

export interface SwitchThumbProps {
  className?: string;
  children?: ReactNode;
  /** Element to render instead of the default `<span>`. */
  render?: ReactElement;
  ref?: Ref<HTMLElement>;
}

/**
 * The moving part of the switch.
 *
 * Reads state from the Root rather than taking props, so a consumer cannot get the
 * two out of step. Carries the same `data-*` attributes as the Root, which is what
 * lets CSS move it:
 *
 *   .switch-thumb[data-checked] { transform: translateX(100%); }
 *
 * Purely presentational — hidden from assistive technology, since the Root already
 * announces the state.
 */
export function SwitchThumb({
  className,
  children,
  render,
  ...rest
}: SwitchThumbProps & Record<string, unknown>) {
  const state = useSwitchRootContext();

  return useRender<SwitchState>({
    render,
    defaultTagName: 'span',
    state,
    stateAttributes: switchStateAttributes,
    props: [{ 'aria-hidden': true, className, children }, rest],
  });
}
