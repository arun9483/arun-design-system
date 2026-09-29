import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/** The state Popover.Root shares with its parts, and projects as `data-*` attributes. */
export type PopoverState = {
  open: boolean;
};

/** What the parts need from the Root beyond its state. */
export type PopoverRootContextValue = PopoverState & {
  /** Every open and close goes through here — Trigger, Close, Esc, light dismiss. */
  setOpen: (open: boolean) => void;
  popupId: string;
  /** `--hl-anchor-<id>`: the trigger's `anchor-name` and the popup's `position-anchor`. */
  anchorName: string;
  /** The trigger, passed as `source` to `showPopover()` so it becomes the invoker. */
  triggerRef: RefObject<HTMLElement | null>;
};

export const PopoverRootContext = createContext<PopoverRootContextValue | null>(null);

export function usePopoverRootContext(part: string): PopoverRootContextValue {
  const context = useContext(PopoverRootContext);

  if (context === null) {
    throw new Error(`<Popover.${part}> must be rendered inside <Popover.Root>.`);
  }

  return context;
}
