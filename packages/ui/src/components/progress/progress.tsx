import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type ProgressOwnProps = {
  className?: string;
  /** Element to render instead of the default `<progress>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLProgressElement>;
};

export type ProgressProps = ProgressOwnProps &
  Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, keyof ProgressOwnProps>;

/**
 * How far along: a native `<progress>` (decision 15). Leave out `value` for indeterminate — the
 * platform's state, styled from `:indeterminate`. Name it with a `<label>` or `aria-label`.
 */
export function Progress({ className, render, ...rest }: ProgressProps) {
  return useRender({
    render,
    defaultTagName: 'progress',
    props: { className: cn('progress', className) },
    consumerProps: rest,
  });
}
