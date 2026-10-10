'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToastRootContext } from './ToastContext';

type ToastActionOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToastActionProps = ToastActionOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ToastActionOwnProps>;

/**
 * A button that does something about the toast — "Undo". It does not close the toast; call
 * `close` in your handler if it should. Keep it optional: a toast can vanish before anyone
 * reaches it, so the same action must be possible elsewhere.
 */
export function ToastAction({ className, children, render, ...rest }: ToastActionProps) {
  useToastRootContext('Action');
  return useRender({
    render,
    defaultTagName: 'button',
    props: { type: 'button', className, children },
    consumerProps: rest as UnknownProps,
  });
}
