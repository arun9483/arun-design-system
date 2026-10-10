'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/** The state HoverCard.Root shares with its parts, and projects as `data-*` attributes. */
export type HoverCardState = {
  open: boolean;
};

/** What the parts need from the Root beyond its state. */
export type HoverCardRootContextValue = HoverCardState & {
  /** Open after the hover delay. */
  openAfterDelay: () => void;
  /** Close after the grace period, so the pointer can reach the card. */
  closeAfterGrace: () => void;
  /** Cancel whatever is pending: the pointer arrived on the trigger or the card. */
  cancelPending: () => void;
  /** Open or close now — keyboard focus, focus leaving, Esc, a press on the trigger. */
  setOpen: (open: boolean) => void;
  popupId: string;
  anchorName: string;
  /** The trigger, so the card can be opened with it as its invoker. */
  triggerRef: RefObject<HTMLElement | null>;
  popupRef: RefObject<HTMLElement | null>;
};

export const HoverCardRootContext = createContext<HoverCardRootContextValue | null>(null);

export function useHoverCardRootContext(part: string): HoverCardRootContextValue {
  const context = useContext(HoverCardRootContext);

  if (context === null) {
    throw new Error(`<HoverCard.${part}> must be rendered inside <HoverCard.Root>.`);
  }

  return context;
}

/** Whether `node` is the trigger, the card, or inside either. */
export function isWithin(node: EventTarget | null, ...elements: (HTMLElement | null)[]): boolean {
  return node instanceof Node && elements.some((element) => element?.contains(node));
}
