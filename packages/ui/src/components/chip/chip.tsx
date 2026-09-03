import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

export type ChipVariant = 'default' | 'accent';

type ChipOwnProps = {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
  /**
   * Element or component to render instead of the default `<span>`. Props, className
   * and ref are merged onto it.
   *
   * @example <Chip render={<li />}>React</Chip>
   * @example <Chip render={<button type="button" />} onClick={…}>React</Chip>
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type ChipProps = ChipOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof ChipOwnProps | 'children'>;

export function Chip({ variant = 'default', className, children, render, ...rest }: ChipProps) {
  const variantClass = variant === 'accent' ? 'chip chip-accent' : 'chip chip-default';

  return useRender({
    render,
    defaultTagName: 'span',
    props: { className: cn(variantClass, className), children },
    consumerProps: rest,
  });
}
