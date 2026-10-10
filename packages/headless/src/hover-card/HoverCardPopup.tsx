'use client';

import { useEffect } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  ReactElement,
  Ref,
} from 'react';
import {
  anchoredDataAttributes,
  anchoredPopupStyle,
  type AnchorAlign,
  type AnchorSide,
  type PopoverElement,
} from '../core/anchoring';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { isWithin, useHoverCardRootContext } from './HoverCardRootContext';
import { hoverCardDataAttributes } from './hoverCardDataAttributes';

export type HoverCardSide = AnchorSide;
export type HoverCardAlign = AnchorAlign;

type HoverCardPopupOwnProps = {
  /** Which side of the trigger to show on. Flips to the opposite side when there is no room. */
  side?: HoverCardSide;
  /** Where along that side: flush with the trigger's start or end edge, or centred on it. */
  align?: HoverCardAlign;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type HoverCardPopupProps = HoverCardPopupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof HoverCardPopupOwnProps | 'popover'>;

/**
 * The card: a native `popover="manual"`, anchored to the trigger as Popover is (decision 12).
 * State drives the element, never the reverse.
 *
 * Opened with the trigger as its `source`, so Tab moves from the trigger into the card and
 * on through its links. It stays open while the pointer or focus is on it, and closes on Esc
 * — which closes only the card, not a Dialog or Popover beneath it.
 *
 * No role: it previews the link, which must make sense without it. It is never opened by
 * touch, so nothing in it can be the only way to do something.
 */
export function HoverCardPopup({
  side = 'bottom',
  align = 'center',
  className,
  children,
  render,
  ...rest
}: HoverCardPopupProps) {
  const {
    open,
    setOpen,
    cancelPending,
    closeAfterGrace,
    popupId,
    anchorName,
    triggerRef,
    popupRef,
  } = useHoverCardRootContext('Popup');

  // Runs after every render, keeping element and state in step.
  useEffect(() => {
    const popup = popupRef.current as PopoverElement | null;
    // jsdom, or a `render` element without the API: nothing to drive.
    if (!popup || typeof popup.showPopover !== 'function') return;

    const shown = popup.matches(':popover-open');
    if (open && !shown) {
      const source = triggerRef.current ?? undefined;
      popup.showPopover(source ? { source } : undefined);
      // A `beforetoggle` listener can cancel the open; report it, so the state follows.
      if (!popup.matches(':popover-open')) setOpen(false);
    } else if (!open && shown) popup.hidePopover();
  });

  // Esc closes the card, and only the card: taken in the capture phase and stopped, so a
  // Dialog or Popover underneath does not also close. Focus goes back to the trigger if it
  // was in the card, so it isn't lost with it.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (isWithin(document.activeElement, popupRef.current)) triggerRef.current?.focus();
      setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, setOpen, popupRef, triggerRef]);

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: popupId,
      popover: 'manual',
      ...anchoredDataAttributes(side, align),
      ...hoverCardDataAttributes({ open }),
      style: anchoredPopupStyle(anchorName, side, align),
      className,
      children,
      ref: popupRef,
      onPointerEnter: cancelPending,
      onPointerLeave: closeAfterGrace,
      onBlur(event: ReactFocusEvent<HTMLElement>) {
        // Focus moving within the card, or back to the trigger, keeps it open.
        if (!isWithin(event.relatedTarget, popupRef.current, triggerRef.current)) setOpen(false);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
