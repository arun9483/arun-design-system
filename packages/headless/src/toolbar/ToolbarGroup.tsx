import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToolbarContext } from './ToolbarRoot';

type ToolbarGroupOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToolbarGroupProps = ToolbarGroupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ToolbarGroupOwnProps>;

/** Related items, side by side: `role="group"`. Its items stay in the Toolbar's arrow keys. */
export function ToolbarGroup({ className, render, ...rest }: ToolbarGroupProps) {
  useToolbarContext('Group');
  return useRender({
    render,
    defaultTagName: 'div',
    props: { role: 'group', className },
    consumerProps: rest as UnknownProps,
  });
}
