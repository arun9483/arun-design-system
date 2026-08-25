import type React from 'react';
import { useRender } from '../../internal/useRender';

type ChipVariant = 'default' | 'accent';

type ChipOwnProps = {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
  /**
   * Element or component to render instead of the default `<span>`. Props, className
   * and ref are merged onto it.
   *
   * @example <Chip render={<li />}>React</Chip>
   * @example <Chip render={<a href="/tags/react" />}>React</Chip>
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
  /**
   * @deprecated Use `render` instead — it accepts any element, not just span/button.
   * `<Chip as="button">` becomes `<Chip render={<button />}>`.
   */
  as?: 'span' | 'button';
  /** Only meaningful when rendering a `<button>`. Defaults to `"button"`. */
  type?: 'button' | 'submit' | 'reset';
};

type ChipProps = ChipOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof ChipOwnProps | 'children'>;

export function Chip({
  variant = 'default',
  className,
  children,
  render,
  as = 'span',
  type,
  ...rest
}: ChipProps) {
  const variantClass = variant === 'accent' ? 'chip chip-accent' : 'chip chip-default';

  // A bare `as="button"` still gets an explicit type, matching the previous behaviour.
  const isButton = render === undefined && as === 'button';
  const typeProp = isButton ? { type: type ?? 'button' } : type ? { type } : undefined;

  return useRender({
    render,
    defaultTagName: as,
    props: [{ className: variantClass }, typeProp, rest, { className, children }],
  });
}
