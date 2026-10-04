import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';
import type { Space } from '../../lib/space';

type GridOwnProps = {
  /**
   * How many equal columns. With `minItemSize`, the most there can be: the grid drops to fewer
   * as the space narrows. Defaults to 1.
   */
  columns?: number;
  /**
   * The narrowest a column may be, as a CSS length — `'12rem'`. The grid fits as many columns
   * as there is room for, so it is responsive with no breakpoints. Never wider than the grid
   * itself, so one column still fits on a phone.
   */
  minItemSize?: string;
  /** Space between rows and columns, a step on the spacing scale. Defaults to `sm`. */
  gap?: Space;
  className?: string;
  /** Element to render instead of the default `<div>` — a `<ul>` of cards, say. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type GridProps = GridOwnProps & Omit<React.HTMLAttributes<HTMLElement>, keyof GridOwnProps>;

/**
 * Children in equal columns: a CSS grid. A fixed count of columns, or as many as fit at
 * `minItemSize` each, at most `columns` (decision 21).
 *
 * The counts reach the CSS as custom properties on the element, set on every Grid so a
 * grid nested in another never inherits the outer one's.
 */
export function Grid({ columns, minItemSize, gap = 'sm', className, render, ...rest }: GridProps) {
  const fit = minItemSize !== undefined;
  const vars = fit
    ? { '--grid-min-item-size': minItemSize, '--grid-columns': columns }
    : { '--grid-columns': columns ?? 1 };

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      className: cn(
        'layout-grid',
        fit && (columns === undefined ? 'layout-grid-fit' : 'layout-grid-fit-capped'),
        `layout-grid-gap-${gap}`,
        className,
      ),
      // Merged with a consumer's `style`, theirs winning.
      style: vars as React.CSSProperties,
    },
    consumerProps: rest,
  });
}
