import { useEffect, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useAvatarContext } from './AvatarRoot';

type AvatarFallbackOwnProps = {
  /** Milliseconds to wait before showing, so a quick image does not flash the initials first. */
  delay?: number;
  /** Element to render instead of the default `<span>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type AvatarFallbackProps = AvatarFallbackOwnProps &
  Omit<ComponentPropsWithRef<'span'>, keyof AvatarFallbackOwnProps>;

/**
 * Initials or an icon, shown until the Image loads, and for good if it fails or there is none.
 * Initials read out as letters; give the Root an `aria-label` with the name, or mark these
 * `aria-hidden` beside a visible name.
 */
export function AvatarFallback({
  delay = 0,
  className,
  children,
  render,
  ...rest
}: AvatarFallbackProps) {
  const { status } = useAvatarContext('Fallback');
  const [waited, setWaited] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setWaited(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const element = useRender({
    render,
    defaultTagName: 'span',
    props: { className, children },
    consumerProps: rest as UnknownProps,
  });
  return status !== 'loaded' && waited ? element : null;
}
