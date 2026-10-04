import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { anchorNameFor } from '../core/anchoring';
import { useControlled } from '../core/useControlled';
import { HoverCardRootContext, type HoverCardRootContextValue } from './HoverCardRootContext';

export type HoverCardRootProps = {
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
  /** Milliseconds a pointer rests on the trigger before the card opens. Focus opens at once. */
  delay?: number;
  /**
   * Milliseconds between the pointer leaving the trigger or the card and the card closing —
   * time to cross the gap between them. Longer than a Tooltip's: the card is bigger, and the
   * pointer is often headed for a link inside it.
   */
  closeDelay?: number;
  children?: ReactNode;
};

/**
 * Holds a hover card's state and timers, and shares them with its parts. Renders no element.
 *
 * The card is a native `popover="manual"`, anchored like Popover and Tooltip (decision 12):
 * `manual`, so it does not close an open Popover, and so it does not light-dismiss — it opens
 * and closes with the pointer and focus instead, on the timing below (decision 24).
 */
export function HoverCardRoot({
  open: openProp,
  defaultOpen,
  onOpenChange,
  delay = 600,
  closeDelay = 300,
  children,
}: HoverCardRootProps) {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name: 'HoverCard.Root',
    state: 'open',
  });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLElement | null>(null);

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
    if (!open) timer.current = setTimeout(() => setOpen(true), delay);
  }, [open, delay, setOpen, cancelPending]);

  const closeAfterGrace = useCallback(() => {
    cancelPending();
    if (open) timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [open, closeDelay, setOpen, cancelPending]);

  useEffect(() => cancelPending, [cancelPending]);

  const id = useId();
  const context: HoverCardRootContextValue = useMemo(
    () => ({
      open,
      setOpen,
      openAfterDelay,
      closeAfterGrace,
      cancelPending,
      popupId: id,
      anchorName: anchorNameFor(id),
      triggerRef,
      popupRef,
    }),
    [open, setOpen, openAfterDelay, closeAfterGrace, cancelPending, id],
  );

  return <HoverCardRootContext.Provider value={context}>{children}</HoverCardRootContext.Provider>;
}
