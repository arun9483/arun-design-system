'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToolbarContext } from './ToolbarRoot';

type ToolbarSeparatorOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToolbarSeparatorProps = ToolbarSeparatorOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ToolbarSeparatorOwnProps | 'children'>;

/**
 * A line between groups of items: `role="separator"`, upright in a horizontal Toolbar. A toolbar
 * may hold separators; the arrow keys pass it.
 */
export function ToolbarSeparator({ className, render, ...rest }: ToolbarSeparatorProps) {
  const { orientation } = useToolbarContext('Separator');
  const own = orientation === 'horizontal' ? 'vertical' : 'horizontal';
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'separator',
      'aria-orientation': own,
      'data-orientation': own,
      className,
    },
    consumerProps: rest as UnknownProps,
  });
}
