'use client';

import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { anchorNameFor } from '../core/anchoring';
import { useControlled } from '../core/useControlled';
import { TooltipRootContext, type TooltipRootContextValue } from './TooltipRootContext';

export type TooltipRootProps = {
  /**
   * Controlled state. Provide `onOpenChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Switch.
   */
  open?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultOpen?: boolean;
  /** Called on every open and close, after any delay has run. */
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds a pointer rests on the trigger before it opens. Focus opens at once. */
  delay?: number;
  /**
   * Milliseconds between the pointer leaving and the tooltip closing — time to move onto
   * the tooltip, which then stays open while hovered (WCAG 1.4.13).
   */
  closeDelay?: number;
  children?: ReactNode;
};

/**
 * Moving from one tooltip to the next skips the delay: someone reading a toolbar's tooltips
 * should not wait on each. A tooltip opens at once while another is open — still in its
 * grace period as the pointer crosses over — or within WARM_WINDOW of one closing.
 * Module-level, so it spans every tooltip without a Provider.
 */
const WARM_WINDOW = 300;
let openCount = 0;
let lastClosedAt = Number.NEGATIVE_INFINITY;

function isWarm(): boolean {
  return openCount > 0 || Date.now() - lastClosedAt < WARM_WINDOW;
}

/**
 * Holds a tooltip's state and timers, and shares them with its parts. Renders no element.
 *
 * The popup is a native `popover="manual"`, anchored like Popover (decision 12). `hint`
 * would be the natural fit, but Safari lacks it; `manual` behaves the same everywhere and,
 * like `hint`, does not close an open Popover when it shows. What `manual` leaves out —
 * opening on hover and focus, closing on leave, blur and Esc — is the timing below.
 */
export function TooltipRoot({
  open: openProp,
  defaultOpen,
  onOpenChange,
  delay = 600,
  closeDelay = 100,
  children,
}: TooltipRootProps) {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name: 'Tooltip.Root',
    state: 'open',
  });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancelPending = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  // The one path every change takes, so the state and the report of it cannot drift.
  const setOpen = useCallback(
    (next: boolean) => {
      cancelPending();
      if (next === open) return;
      setOpenState(next);
      onOpenChange?.(next);
    },
    [open, setOpenState, onOpenChange, cancelPending],
  );

  const openAfterDelay = useCallback(() => {
    cancelPending();
    if (open) return;
    if (isWarm()) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  }, [open, delay, setOpen, cancelPending]);

  const closeAfterGrace = useCallback(() => {
    cancelPending();
    if (!open) return;
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [open, closeDelay, setOpen, cancelPending]);

  useEffect(() => cancelPending, [cancelPending]);

  // Counted from the state itself, so a controlled parent's choice and an unmount while
  // open both keep the count true.
  useEffect(() => {
    if (!open) return;
    openCount += 1;
    return () => {
      openCount -= 1;
      lastClosedAt = Date.now();
    };
  }, [open]);

  const id = useId();
  const context: TooltipRootContextValue = useMemo(
    () => ({
      open,
      setOpen,
      openAfterDelay,
      closeAfterGrace,
      cancelPending,
      popupId: id,
      anchorName: anchorNameFor(id),
    }),
    [open, setOpen, openAfterDelay, closeAfterGrace, cancelPending, id],
  );

  return <TooltipRootContext.Provider value={context}>{children}</TooltipRootContext.Provider>;
}
