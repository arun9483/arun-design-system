import { useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useRovingItem } from '../core/rovingGroup';
import { useToolbarContext } from './ToolbarRoot';

type ToolbarLinkOwnProps = {
  /** Element to render instead of the default `<a>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToolbarLinkProps = ToolbarLinkOwnProps &
  Omit<ComponentPropsWithRef<'a'>, keyof ToolbarLinkOwnProps>;

/**
 * A link in the Toolbar, one of its arrow-key items. A link cannot be disabled.
 */
export function ToolbarLink({ className, render, ...rest }: ToolbarLinkProps) {
  useToolbarContext('Link');
  const elementRef = useRef<HTMLElement | null>(null);
  const roving = useRovingItem(elementRef, false);
  return useRender({
    render,
    defaultTagName: 'a',
    props: {
      tabIndex: roving.tabIndex,
      className,
      ref: elementRef,
      onFocus: roving.onFocus,
    },
    consumerProps: rest as UnknownProps,
  });
}
