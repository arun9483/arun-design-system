import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToastContext, useToastRootContext } from './ToastContext';

type ToastCloseOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToastCloseProps = ToastCloseOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ToastCloseOwnProps>;

/** Closes its toast. Give it an `aria-label` — "Dismiss" — if it shows only an icon. */
export function ToastClose({ className, children, render, ...rest }: ToastCloseProps) {
  const { close } = useToastContext('<Toast.Close>');
  const { id } = useToastRootContext('Close');
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      className,
      children,
      onClick() {
        close(id);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
