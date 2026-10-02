import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type SpinnerOwnProps = {
  className?: string;
  /** Element to render instead of the default `<progress>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLProgressElement>;
};

export type SpinnerProps = SpinnerOwnProps &
  Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, keyof SpinnerOwnProps | 'value' | 'max'>;

/**
 * Working, with no end known: a `<progress>` without a value (decision 16), drawn as a turning
 * ring. A `progressbar` to assistive technology, named "Loading" unless `aria-label` says more.
 */
export function Spinner({ className, render, ...rest }: SpinnerProps) {
  return useRender({
    render,
    defaultTagName: 'progress',
    props: { 'aria-label': 'Loading', className: cn('spinner', className) },
    consumerProps: rest,
  });
}
