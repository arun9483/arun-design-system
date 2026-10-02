import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type SeparatorOwnProps = {
  /** Across, the default, or upright between inline items. Sets `aria-orientation`. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  /** Element to render instead of the default `<hr>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type SeparatorProps = SeparatorOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof SeparatorOwnProps | 'children'>;

/**
 * A line between sections: an `<hr>`, so the platform exposes it as a separator (decision 15).
 * A purely decorative line takes `aria-hidden`.
 */
export function Separator({
  orientation = 'horizontal',
  className,
  render,
  ...rest
}: SeparatorProps) {
  return useRender({
    render,
    defaultTagName: 'hr',
    props: {
      className: cn('separator', className),
      'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
      'data-orientation': orientation,
    },
    consumerProps: rest,
  });
}
