'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToastRootContext } from './ToastContext';

type ToastTitleOwnProps = {
  /** Element to render instead of the default `<p>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToastTitleProps = ToastTitleOwnProps &
  Omit<ComponentPropsWithRef<'p'>, keyof ToastTitleOwnProps>;

/** The toast's title. Its children default to the toast's `title`. */
export function ToastTitle({ className, children, render, ...rest }: ToastTitleProps) {
  const toast = useToastRootContext('Title');
  return useRender({
    render,
    defaultTagName: 'p',
    props: { className, children: children ?? toast.title },
    consumerProps: rest as UnknownProps,
  });
}
