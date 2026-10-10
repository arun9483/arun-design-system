'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';

/** Where the Image is: none yet, on its way, shown, or failed for good. */
export type AvatarImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

type AvatarContextValue = {
  status: AvatarImageStatus;
  setStatus: (status: AvatarImageStatus) => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

export function useAvatarContext(part: string): AvatarContextValue {
  const context = useContext(AvatarContext);
  if (!context) throw new Error(`<Avatar.${part}> must be rendered inside <Avatar.Root>.`);
  return context;
}

type AvatarRootOwnProps = {
  /** Element to render instead of the default `<span>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type AvatarRootProps = AvatarRootOwnProps &
  Omit<ComponentPropsWithRef<'span'>, keyof AvatarRootOwnProps>;

/**
 * A person's picture, or their initials until it loads (decision 17). Holds whether the Image
 * has loaded; `data-image-status` carries it for styling.
 */
export function AvatarRoot({ className, children, render, ...rest }: AvatarRootProps) {
  const [status, setStatus] = useState<AvatarImageStatus>('idle');
  const context = useMemo(() => ({ status, setStatus }), [status]);
  const element = useRender({
    render,
    defaultTagName: 'span',
    props: { 'data-image-status': status, className, children },
    consumerProps: rest as UnknownProps,
  });
  return <AvatarContext.Provider value={context}>{element}</AvatarContext.Provider>;
}
