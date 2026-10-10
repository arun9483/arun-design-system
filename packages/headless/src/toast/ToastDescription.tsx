'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToastRootContext } from './ToastContext';

type ToastDescriptionOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToastDescriptionProps = ToastDescriptionOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ToastDescriptionOwnProps>;

/** The toast's description. Its children default to the toast's `description`. */
export function ToastDescription({ className, children, render, ...rest }: ToastDescriptionProps) {
  const toast = useToastRootContext('Description');
  return useRender({
    render,
    defaultTagName: 'div',
    props: { className, children: children ?? toast.description },
    consumerProps: rest as UnknownProps,
  });
}
