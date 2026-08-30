import type React from 'react';
import { useRender } from '@arun-dev/headless';

/** Generic status tones. Map your own domain vocabulary onto these at the call site. */
export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

type BadgeOwnProps = {
  /**
   * Visual tone. Defaults to `"neutral"`.
   *
   * @example
   * const TONE = { beginner: 'success', intermediate: 'warning', advanced: 'error' } as const;
   * <Badge tone={TONE[difficulty]}>{label}</Badge>
   */
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
  /**
   * Element or component to render instead of the default `<span>`. Props, className
   * and ref are merged onto it.
   *
   * @example <Badge render={<li />}>Beginner</Badge>
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type BadgeProps = BadgeOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BadgeOwnProps | 'children'>;

export function Badge({ tone = 'neutral', className, children, render, ...rest }: BadgeProps) {
  const classes = tone === 'neutral' ? 'chip badge' : `chip badge badge-${tone}`;

  return useRender({
    render,
    defaultTagName: 'span',
    props: [{ className: classes }, rest, { className, children }],
  });
}
