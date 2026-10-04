import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';
import {
  typographyClasses,
  type TextColor,
  type TextSize,
  type TextWeight,
} from '../../lib/typography';

type TextOwnProps = {
  /** A step on the type scale. Left out, it takes the size around it. */
  size?: TextSize;
  /** A text colour role. Left out, it takes the colour around it. */
  color?: TextColor;
  /** A font weight. Left out, it takes the weight around it. */
  weight?: TextWeight;
  className?: string;
  /**
   * Element to render instead of the default `<span>` — a `<strong>` or `<em>` when the
   * emphasis is meaning, not only looks; a `<time>`; a `<label>`.
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type TextProps = TextOwnProps & Omit<React.HTMLAttributes<HTMLElement>, keyof TextOwnProps>;

/**
 * A run of text with a size, colour or weight from the tokens: a `<span>`, which carries no
 * meaning of its own (decision 22).
 */
export function Text({ size, color, weight, className, render, ...rest }: TextProps) {
  return useRender({
    render,
    defaultTagName: 'span',
    props: { className: cn(...typographyClasses({ size, color, weight }), className) || undefined },
    consumerProps: rest,
  });
}
