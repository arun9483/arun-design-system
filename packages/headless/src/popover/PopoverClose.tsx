import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { usePopoverRootContext } from './PopoverRootContext';

type PopoverCloseOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type PopoverCloseProps = PopoverCloseOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof PopoverCloseOwnProps>;

/**
 * Closes the popover. Esc and a click outside already do; this is the visible way, for
 * pointer users and for screen reader users who would not guess either.
 */
export function PopoverClose({ className, children, render, ...rest }: PopoverCloseProps) {
  const { setOpen } = usePopoverRootContext('Close');

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
