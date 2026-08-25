import type React from 'react';
import { useRender } from '../../internal/useRender';

/** Generic status tones. Map your own domain vocabulary onto these at the call site. */
export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

type BadgeVariant =
  | 'default'
  | 'difficulty-beginner'
  | 'difficulty-intermediate'
  | 'difficulty-advanced';

type BadgeOwnProps = {
  /**
   * Visual tone. Defaults to `"neutral"`.
   *
   * @example
   * const TONE = { beginner: 'success', intermediate: 'warning', advanced: 'error' } as const;
   * <Badge tone={TONE[difficulty]}>{label}</Badge>
   */
  tone?: BadgeTone;
  /**
   * @deprecated Use `tone` instead. The `difficulty-*` values require the consuming app
   * to define `--color-difficulty-*` tokens that `@arun-dev/tokens` does not ship.
   * Removed in the next minor.
   */
  variant?: BadgeVariant;
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

type BadgeProps = BadgeOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BadgeOwnProps | 'children'>;

export function Badge({
  tone = 'neutral',
  variant,
  className,
  children,
  render,
  ...rest
}: BadgeProps) {
  const classes = ['chip', 'badge'];
  if (tone !== 'neutral') classes.push(`badge-${tone}`);
  // Deprecated path — kept until consumers migrate to `tone`.
  if (variant !== undefined && variant !== 'default') classes.push(variant);

  return useRender({
    render,
    defaultTagName: 'span',
    props: [{ className: classes.join(' ') }, rest, { className, children }],
  });
}
