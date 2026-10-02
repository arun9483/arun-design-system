import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type SkeletonOwnProps = {
  className?: string;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type SkeletonProps = SkeletonOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof SkeletonOwnProps | 'children'>;

/**
 * A placeholder shape while content loads (decision 16). Hidden from assistive technology: put
 * `aria-busy="true"` on the region it stands in for. Size and shape are yours — `style` or a class.
 */
export function Skeleton({ className, render, ...rest }: SkeletonProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: { 'aria-hidden': true, className: cn('skeleton', className) },
    consumerProps: rest,
  });
}
