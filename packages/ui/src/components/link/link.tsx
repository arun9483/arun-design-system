import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type LinkOwnProps = {
  className?: string;
  /**
   * Your router's link, to navigate without a reload. The styling stays; props and ref are
   * merged onto it.
   *
   * @example <Link render={<NextLink href="/docs" />}>Docs</Link>
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLAnchorElement>;
};

export type LinkProps = LinkOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkOwnProps>;

/**
 * Navigation: always an `<a href>` (decision 15), so focus, activation, "open in new tab" and
 * the browser's history are the platform's. There is no `disabled` — it has no meaning on a
 * link. An action that changes something is a `Button`.
 */
export function Link({ className, render, ...rest }: LinkProps) {
  return useRender({
    render,
    defaultTagName: 'a',
    props: { className: cn('link', className) },
    consumerProps: rest,
  });
}
