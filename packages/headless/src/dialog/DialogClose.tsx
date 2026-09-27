import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useDialogRootContext } from './DialogRootContext';

type DialogCloseOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type DialogCloseProps = DialogCloseOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof DialogCloseOwnProps>;

/**
 * Closes the dialog — a Cancel button, or an icon-only × with an `aria-label`. A native
 * `<button>`; the request goes through the Root, so a controlled parent can refuse it.
 */
export function DialogClose({ className, children, render, ...rest }: DialogCloseProps) {
  const { setOpen } = useDialogRootContext('Close');

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      className,
      children,
      onClick() {
        setOpen(false);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
