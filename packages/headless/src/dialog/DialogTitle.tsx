'use client';

import { useId, useLayoutEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useDialogRootContext } from './DialogRootContext';

type DialogTitleOwnProps = {
  /** Element to render instead of the default `<h2>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type DialogTitleProps = DialogTitleOwnProps &
  Omit<ComponentPropsWithRef<'h2'>, keyof DialogTitleOwnProps>;

/**
 * The dialog's heading, and its accessible name: the popup's `aria-labelledby` points at
 * this element's `id` — yours if you pass one, a generated one otherwise.
 */
export function DialogTitle({
  id: idProp,
  className,
  children,
  render,
  ...rest
}: DialogTitleProps) {
  const { setTitleId } = useDialogRootContext('Title');
  const generatedId = useId();
  const id = idProp ?? generatedId;

  // Layout effect, so the popup is labelled before the browser paints it.
  useLayoutEffect(() => {
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [id, setTitleId]);

  return useRender({
    render,
    defaultTagName: 'h2',
    props: { id, className, children },
    consumerProps: rest as UnknownProps,
  });
}
