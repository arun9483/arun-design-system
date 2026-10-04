import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';
import type { Space } from '../../lib/space';

type StackOwnProps = {
  /** Down the page, the default, or across it. */
  direction?: 'column' | 'row';
  /** Space between the children, a step on the spacing scale. Defaults to `sm`. */
  gap?: Space;
  /** How children line up across the stack — across a column, or down a row. Stretched by default. */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  /** How children are spread along the stack. Packed at the start by default. */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Lets children move onto a new line when they run out of room, as a row of chips does. */
  wrap?: boolean;
  className?: string;
  /**
   * Element to render instead of the default `<div>` — a `<ul>`, a `<form>`, a `<section>`.
   * Props and ref are merged onto it.
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type StackProps = StackOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof StackOwnProps>;

/**
 * Children in a line, down or across, with a gap from the spacing scale between them: a
 * flex container. The space belongs to the layout, not to margins on the children, so a
 * reset cannot collapse it and a child's own margin is never doubled (decision 21).
 */
export function Stack({
  direction = 'column',
  gap = 'sm',
  align,
  justify,
  wrap = false,
  className,
  render,
  ...rest
}: StackProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      className: cn(
        'layout-stack',
        direction === 'row' && 'layout-stack-row',
        `layout-stack-gap-${gap}`,
        align && `layout-stack-align-${align}`,
        justify && `layout-stack-justify-${justify}`,
        wrap && 'layout-stack-wrap',
        className,
      ),
    },
    consumerProps: rest,
  });
}
