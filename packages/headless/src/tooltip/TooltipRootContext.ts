import { createContext, useContext } from 'react';

/** The state Tooltip.Root shares with its parts, and projects as `data-*` attributes. */
export type TooltipState = {
  open: boolean;
};

/** What the parts need from the Root beyond its state. */
export type TooltipRootContextValue = TooltipState & {
  /** Open after the hover delay, unless one closed a moment ago (see TooltipRoot). */
  openAfterDelay: () => void;
  /** Close after the grace period, so the pointer can reach the tooltip. */
  closeAfterGrace: () => void;
  /** Cancel whatever is pending. */
  cancelPending: () => void;
  /** Open or close now — keyboard focus, blur, Esc, a press on the trigger. */
  setOpen: (open: boolean) => void;
  popupId: string;
  anchorName: string;
};

export const TooltipRootContext = createContext<TooltipRootContextValue | null>(null);

export function useTooltipRootContext(part: string): TooltipRootContextValue {
  const context = useContext(TooltipRootContext);

  if (context === null) {
    throw new Error(`<Tooltip.${part}> must be rendered inside <Tooltip.Root>.`);
  }

  return context;
}
