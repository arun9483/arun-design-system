import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';
import { typographyClasses, type TextSize } from '../../lib/typography';

/** A heading's rank in the document outline: `<h1>` to `<h6>`. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The size each level gets when `size` is left out. */
const SIZE_FOR_LEVEL: Record<HeadingLevel, TextSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'base',
};

type HeadingOwnProps = {
  /**
   * Its rank in the outline, so `<h1>` to `<h6>`. Choose by structure — the section it
   * heads — and set the look with `size`. Defaults to 2.
   */
  level?: HeadingLevel;
  /** How big it looks, a step on the type scale. Defaults to a size for the level. */
  size?: TextSize;
  className?: string;
  /** Element to render instead of the `<h1>`–`<h6>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLHeadingElement>;
};

export type HeadingProps = HeadingOwnProps &
  Omit<React.HTMLAttributes<HTMLHeadingElement>, keyof HeadingOwnProps>;

/**
 * A section heading: a native `<h1>`–`<h6>`, so the outline assistive technology navigates by
 * is the platform's. The level is structure and `size` is appearance, kept apart so a heading
 * never has to skip a level to look smaller (decision 22).
 */
export function Heading({ level = 2, size, className, render, ...rest }: HeadingProps) {
  return useRender({
    render,
    defaultTagName: `h${level}`,
    props: {
      className: cn(
        'heading',
        ...typographyClasses({ size: size ?? SIZE_FOR_LEVEL[level] }),
        className,
      ),
    },
    consumerProps: rest,
  });
}
