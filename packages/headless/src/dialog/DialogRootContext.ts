'use client';

import { createContext, useContext } from 'react';

/** The state Dialog.Root shares with its parts, and projects as `data-*` attributes. */
export type DialogState = {
  open: boolean;
};

/** What the parts need from the Root beyond its state: the one setter, and ARIA ids. */
export type DialogRootContextValue = DialogState & {
  /** Every open and close goes through here — trigger, Close, Esc, backdrop, a form. */
  setOpen: (open: boolean) => void;
  closeOnBackdropClick: boolean;
  popupId: string;
  /** The mounted Title's id, for the popup's `aria-labelledby`; undefined without one. */
  titleId: string | undefined;
  setTitleId: (id: string | undefined) => void;
};

export const DialogRootContext = createContext<DialogRootContextValue | null>(null);

export function useDialogRootContext(part: string): DialogRootContextValue {
  const context = useContext(DialogRootContext);

  if (context === null) {
    throw new Error(`<Dialog.${part}> must be rendered inside <Dialog.Root>.`);
  }

  return context;
}
