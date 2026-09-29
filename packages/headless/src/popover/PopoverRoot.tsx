import { useCallback, useId, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useControlled } from '../core/useControlled';
import { PopoverRootContext, type PopoverRootContextValue } from './PopoverRootContext';

export type PopoverRootProps = {
  /**
   * Controlled state. Provide `onOpenChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Switch.
   */
  open?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultOpen?: boolean;
  /**
   * Called on every request to open or close — Trigger, Close, Esc, or a click outside.
   * A controlled popover moves only if the parent accepts it.
   */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

/** A CSS dashed-ident from React's id, which may hold characters an ident cannot. */
function toAnchorName(id: string): string {
  return `--hl-anchor-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/**
 * Holds a popover's state and shares it with its parts. Renders no element of its own.
 *
 * The popup is a native `popover`, placed by CSS anchor positioning (decision 12): the
 * platform supplies the top layer, light dismiss, Esc, the Tab order from the trigger and
 * focus return; the browser keeps it attached. This component adds state, one setter every
 * close goes through, and the anchor wiring.
 */
export function PopoverRoot({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverRootProps) {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name: 'Popover.Root',
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

  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);

  const context: PopoverRootContextValue = useMemo(
    () => ({ open, setOpen, popupId: id, anchorName: toAnchorName(id), triggerRef }),
    [open, setOpen, id],
  );

  return <PopoverRootContext.Provider value={context}>{children}</PopoverRootContext.Provider>;
}
