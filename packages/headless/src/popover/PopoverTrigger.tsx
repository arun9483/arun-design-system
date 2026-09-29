import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { usePopoverRootContext } from './PopoverRootContext';
import { popoverDataAttributes } from './popoverDataAttributes';

type PopoverTriggerOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type PopoverTriggerProps = PopoverTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof PopoverTriggerOwnProps>;

/**
 * Opens and closes the popover, and is what it is anchored to: it carries the
 * `anchor-name` the popup positions against. A native `<button>`, so focus and activation
 * are the platform's.
 *
 * It becomes the popup's invoker when it opens, so a click on it while open is not a
 * click outside — it toggles the popover closed rather than light-dismissing and reopening.
 */
export function PopoverTrigger({ className, children, render, ...rest }: PopoverTriggerProps) {
  const { open, setOpen, popupId, anchorName, triggerRef } = usePopoverRootContext('Trigger');

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      'aria-controls': popupId,
      ...popoverDataAttributes({ open }),
      style: { anchorName },
      className,
      children,
      ref: triggerRef,
      onClick() {
        setOpen(!open);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
