import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import {
  anchoredDataAttributes,
  anchoredPopupStyle,
  type AnchorAlign,
  type AnchorSide,
} from '../core/anchoring';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useTooltipRootContext } from './TooltipRootContext';
import { tooltipDataAttributes } from './tooltipDataAttributes';

export type TooltipSide = AnchorSide;
export type TooltipAlign = AnchorAlign;

type TooltipPopupOwnProps = {
  /** Which side of the trigger to show on. Flips to the opposite side when there is no room. */
  side?: TooltipSide;
  /** Where along that side: flush with the trigger's start or end edge, or centred on it. */
  align?: TooltipAlign;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TooltipPopupProps = TooltipPopupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof TooltipPopupOwnProps | 'popover'>;

/**
 * The tooltip: a native `popover="manual"` with `role="tooltip"`, anchored to the trigger
 * as Popover is (decision 12). State drives the element, never the reverse.
 *
 * It stays open while the pointer is on it, so its text can be read and selected, and
 * closes on Esc — which closes only the tooltip, not a Dialog or Popover beneath it.
 *
 * Text only, by the ARIA pattern: it describes the trigger and is never focused, so it must
 * not hold anything interactive. Use a Popover for that.
 */
export function TooltipPopup({
  side = 'top',
  align = 'center',
  className,
  children,
  render,
  ...rest
}: TooltipPopupProps) {
  const { open, setOpen, cancelPending, closeAfterGrace, popupId, anchorName } =
    useTooltipRootContext('Popup');
  const elementRef = useRef<HTMLElement | null>(null);

  // Runs after every render, keeping element and state in step.
  useEffect(() => {
    const popup = elementRef.current;
    // jsdom, or a `render` element without the API: nothing to drive.
    if (!popup || typeof popup.showPopover !== 'function') return;

    const shown = popup.matches(':popover-open');
    // No `source`: that would make the trigger an invoker and put the tooltip in its Tab
    // order, and a tooltip is never focused.
    if (open && !shown) popup.showPopover();
    else if (!open && shown) popup.hidePopover();
  });

  // Esc closes the tooltip, and only the tooltip: taken in the capture phase and stopped,
  // so a Dialog or Popover underneath does not also close.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, setOpen]);

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: popupId,
      popover: 'manual',
      role: 'tooltip',
      ...anchoredDataAttributes(side, align),
      ...tooltipDataAttributes({ open }),
      style: anchoredPopupStyle(anchorName, side, align),
      className,
      children,
      ref: elementRef,
      onPointerEnter: cancelPending,
      onPointerLeave: closeAfterGrace,
    },
    consumerProps: rest as UnknownProps,
  });
}
