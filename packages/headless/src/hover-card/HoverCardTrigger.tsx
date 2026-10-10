'use client';

import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { isWithin, useHoverCardRootContext } from './HoverCardRootContext';
import { hoverCardDataAttributes } from './hoverCardDataAttributes';

type HoverCardTriggerOwnProps = {
  /**
   * Element to render instead of the default `<a>` — a router's link, or the design system's
   * Link. Props and ref are merged onto it.
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type HoverCardTriggerProps = HoverCardTriggerOwnProps &
  Omit<ComponentPropsWithRef<'a'>, keyof HoverCardTriggerOwnProps>;

/**
 * The link the card previews, and the element it is anchored to. A native `<a>`: a hover
 * card shows more about where a link goes, and the link must work without it.
 *
 * - A mouse or pen resting on it opens the card after the Root's `delay`; leaving closes it
 *   after `closeDelay`, unless the pointer reaches the card first. Touch never opens it:
 *   there is no hover, and a tap follows the link.
 * - Keyboard focus opens it at once, and Tab moves on into the card. Focus leaving both the
 *   trigger and the card closes it. Focus from a click does not open it.
 * - Pressing it closes the card, since the press is what the user came to do.
 */
export function HoverCardTrigger({ className, children, render, ...rest }: HoverCardTriggerProps) {
  const { open, setOpen, openAfterDelay, closeAfterGrace, anchorName, triggerRef, popupRef } =
    useHoverCardRootContext('Trigger');

  return useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...hoverCardDataAttributes({ open }),
      style: { anchorName },
      className,
      children,
      ref: triggerRef,
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
      onBlur(event: ReactFocusEvent<HTMLElement>) {
        // Tabbing into the card keeps it open; focus going anywhere else closes it.
        if (!isWithin(event.relatedTarget, popupRef.current)) setOpen(false);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
