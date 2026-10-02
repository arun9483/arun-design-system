import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type KbdOwnProps = {
  className?: string;
  /** Element to render instead of the default `<kbd>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type KbdProps = KbdOwnProps & Omit<React.HTMLAttributes<HTMLElement>, keyof KbdOwnProps>;

/** A key: a styled `<kbd>` (decision 17). Write a combination as keys side by side. */
export function Kbd({ className, render, ...rest }: KbdProps) {
  return useRender({
    render,
    defaultTagName: 'kbd',
    props: { className: cn('kbd', className) },
    consumerProps: rest,
  });
}
