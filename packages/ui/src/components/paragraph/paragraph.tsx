import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';
import { typographyClasses, type TextColor, type TextSize } from '../../lib/typography';

type ParagraphOwnProps = {
  /** A step on the type scale. Left out, it takes the size around it. */
  size?: TextSize;
  /** A text colour role. Left out, it takes the colour around it. */
  color?: TextColor;
  className?: string;
  /** Element to render instead of the default `<p>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLParagraphElement>;
};

export type ParagraphProps = ParagraphOwnProps &
  Omit<React.HTMLAttributes<HTMLParagraphElement>, keyof ParagraphOwnProps>;

/**
 * A block of running text: a native `<p>`, kept to a readable line length (decision 22).
 */
export function Paragraph({ size, color, className, render, ...rest }: ParagraphProps) {
  return useRender({
    render,
    defaultTagName: 'p',
    props: { className: cn('paragraph', ...typographyClasses({ size, color }), className) },
    consumerProps: rest,
  });
}
