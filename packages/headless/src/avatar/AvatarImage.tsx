'use client';

import { useLayoutEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useAvatarContext } from './AvatarRoot';

type AvatarImageOwnProps = {
  /** Element to render instead of the default `<img>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type AvatarImageProps = AvatarImageOwnProps &
  Omit<ComponentPropsWithRef<'img'>, keyof AvatarImageOwnProps>;

/**
 * The picture. Loaded off-screen first, and rendered only once it has loaded, so a broken
 * image never shows — the Fallback does instead. Give it an `alt`: the person's name.
 */
export function AvatarImage({
  src,
  srcSet,
  sizes,
  crossOrigin,
  referrerPolicy,
  className,
  render,
  ...rest
}: AvatarImageProps) {
  const { status, setStatus } = useAvatarContext('Image');

  useLayoutEffect(() => {
    if (!src && !srcSet) {
      setStatus('error');
      return;
    }
    let active = true;
    const image = new window.Image();
    const settle = (next: 'loaded' | 'error') => () => {
      if (active) setStatus(next);
    };
    image.onload = settle('loaded');
    image.onerror = settle('error');
    if (crossOrigin !== undefined) image.crossOrigin = crossOrigin;
    if (referrerPolicy) image.referrerPolicy = referrerPolicy;
    if (sizes) image.sizes = sizes;
    if (srcSet) image.srcset = srcSet;
    if (src) image.src = src;
    setStatus(image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading');
    return () => {
      active = false;
    };
  }, [src, srcSet, sizes, crossOrigin, referrerPolicy, setStatus]);

  const element = useRender({
    render,
    defaultTagName: 'img',
    props: { src, srcSet, sizes, crossOrigin, referrerPolicy, className },
    consumerProps: rest as UnknownProps,
  });
  return status === 'loaded' ? element : null;
}
