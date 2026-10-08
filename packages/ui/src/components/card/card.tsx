import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type CardOwnProps = {
  /** Tag to render. Prefer `render` when you need a component rather than a tag name. */
  as?: keyof React.JSX.IntrinsicElements;
  lift?: boolean;
  className?: string;
  /** The content. Optional when `render` brings its own, as a link card does. */
  children?: React.ReactNode;
  /**
   * Element or component to render instead of the default `<div>`. Props, className
   * and ref are merged onto it, and its own children win.
   *
   * @example <Card render={<article />} lift>…</Card>
   * @example <Card render={<a href="/guide">…</a>} lift />
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type CardProps = CardOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof CardOwnProps | 'children'>;

export function Card({ as = 'div', lift, className, children, render, ...rest }: CardProps) {
  const cls = ['card', lift && 'card-lift'].filter(Boolean).join(' ');

  return useRender({
    render,
    defaultTagName: as,
    props: { className: cn(cls, className), children },
    consumerProps: rest,
  });
}
