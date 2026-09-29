import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useTooltipRootContext } from './TooltipRootContext';
import { tooltipDataAttributes } from './tooltipDataAttributes';

type TooltipTriggerOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TooltipTriggerProps = TooltipTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof TooltipTriggerOwnProps>;

/**
 * The element the tooltip describes and is anchored to. A native `<button>` by default;
 * render another focusable element when the tooltip belongs to one — a Popover.Trigger,
 * say, or a link.
 *
 * - A mouse or pen resting on it opens the tooltip after the Root's `delay`; leaving
 *   closes it after `closeDelay`. Touch never opens it: there is no hover to end it.
 * - Keyboard focus opens it at once; blur closes it. Focus from a click does not open it —
 *   only `:focus-visible` does.
 * - Pressing it closes the tooltip, since the press is what the user came to do.
 *
 * `aria-describedby` points at the tooltip at all times — the description is read from the
 * hidden element too — and is joined with any of yours.
 */
export function TooltipTrigger({
  className,
  children,
  render,
  'aria-describedby': describedBy,
  ...rest
}: TooltipTriggerProps) {
  const { open, setOpen, openAfterDelay, closeAfterGrace, popupId, anchorName } =
    useTooltipRootContext('Trigger');

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      'aria-describedby': describedBy ? `${describedBy} ${popupId}` : popupId,
      ...tooltipDataAttributes({ open }),
      style: { anchorName },
      className,
      children,
      onPointerEnter(event: ReactPointerEvent) {
        if (event.pointerType !== 'touch') openAfterDelay();
      },
      onPointerLeave(event: ReactPointerEvent) {
        if (event.pointerType !== 'touch') closeAfterGrace();
      },
      onPointerDown() {
        setOpen(false);
      },
      onFocus(event: ReactFocusEvent<HTMLElement>) {
        if (event.currentTarget.matches(':focus-visible')) setOpen(true);
      },
      onBlur() {
        setOpen(false);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
