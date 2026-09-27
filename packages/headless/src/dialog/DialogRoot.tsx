import { useCallback, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useControlled } from '../core/useControlled';
import { DialogRootContext, type DialogRootContextValue } from './DialogRootContext';

export type DialogRootProps = {
  /**
   * Controlled state. Provide `onOpenChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Switch.
   */
  open?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultOpen?: boolean;
  /**
   * Called on every request to open or close — Trigger, Close, Esc, a backdrop click or a
   * `<form method="dialog">`. A controlled dialog moves only if the parent accepts it.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Close when the backdrop is clicked. On by default; turn it off where an accidental
   * click would lose work. Esc and `Dialog.Close` still close.
   */
  closeOnBackdropClick?: boolean;
  children?: ReactNode;
};

/**
 * Holds a dialog's state and shares it with its parts. Renders no element of its own.
 *
 * The dialog itself is a native `<dialog>` opened with `showModal()` (decision 7), so
 * the platform supplies the top layer, the backdrop, the inert page behind it, the focus
 * trap and focus return. What this component adds is state: one `open` value, one setter
 * every close path goes through, and the ids that wire up ARIA.
 */
export function DialogRoot({
  open: openProp,
  defaultOpen,
  onOpenChange,
  closeOnBackdropClick = true,
  children,
}: DialogRootProps) {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name: 'Dialog.Root',
    state: 'open',
  });

  // The one path every change takes, so the state and the report of it cannot drift.
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      setOpenState(next);
      onOpenChange?.(next);
    },
    [open, setOpenState, onOpenChange],
  );

  const popupId = useId();
  const [titleId, setTitleId] = useState<string | undefined>(undefined);

  const context: DialogRootContextValue = useMemo(
    () => ({ open, setOpen, closeOnBackdropClick, popupId, titleId, setTitleId }),
    [open, setOpen, closeOnBackdropClick, popupId, titleId],
  );

  return <DialogRootContext.Provider value={context}>{children}</DialogRootContext.Provider>;
}
