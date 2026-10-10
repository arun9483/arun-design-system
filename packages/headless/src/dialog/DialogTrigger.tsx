'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useDialogRootContext } from './DialogRootContext';
import { dialogDataAttributes } from './dialogDataAttributes';

type DialogTriggerOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type DialogTriggerProps = DialogTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof DialogTriggerOwnProps>;

/**
 * Opens the dialog. A native `<button>`, so focus and activation are the platform's, and
 * where focus returns when the dialog closes.
 *
 * Optional: a dialog opened from state alone — after a save, say — needs no Trigger.
 */
export function DialogTrigger({ className, children, render, ...rest }: DialogTriggerProps) {
  const { open, setOpen, popupId } = useDialogRootContext('Trigger');

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      'aria-controls': popupId,
      ...dialogDataAttributes({ open }),
      className,
      children,
      onClick() {
        setOpen(true);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
