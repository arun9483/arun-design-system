import type React from 'react';
import { useRender } from '../../internal/useRender';

type CardOwnProps = {
  /** Tag to render. Prefer `render` when you need a component rather than a tag name. */
  as?: keyof React.JSX.IntrinsicElements;
  lift?: boolean;
  className?: string;
  children: React.ReactNode;
  /**
   * Element or component to render instead of the default `<div>`. Props, className
   * and ref are merged onto it.
   *
   * @example <Card render={<article />} lift>…</Card>
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

type CardProps = CardOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof CardOwnProps | 'children'>;

export function Card({ as = 'div', lift, className, children, render, ...rest }: CardProps) {
  const cls = ['card', lift && 'card-lift'].filter(Boolean).join(' ');

  return useRender({
    render,
    defaultTagName: as,
    props: [{ className: cls }, rest, { className, children }],
  });
}
