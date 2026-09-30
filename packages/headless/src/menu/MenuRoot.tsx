import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { anchorNameFor } from '../core/anchoring';
import { byDocumentOrder } from '../core/rovingFocus';
import { useControlled } from '../core/useControlled';
import {
  MenuRootContext,
  type MenuFocusOnOpen,
  type MenuItemEntry,
  type MenuRootContextValue,
} from './MenuRootContext';

export type MenuRootProps = {
  /**
   * Controlled state. Provide `onOpenChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Switch.
   */
  open?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultOpen?: boolean;
  /**
   * Called on every request to open or close — Trigger, an Item, Tab, Esc, or a click
   * outside. A controlled menu moves only if the parent accepts it.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Keeps disabled items in the arrow-key sequence, so a screen reader announces them as
   * unavailable. They still cannot be activated. Off by default: the arrows skip them.
   */
  focusableWhenDisabled?: boolean;
  children?: ReactNode;
};

/**
 * A menu button, by the WAI-ARIA pattern: a Trigger that opens a list of actions. Holds the
 * state and shares it with its parts. Renders no element of its own.
 *
 * The popup is a native `popover`, anchored like Popover (decision 12): the platform supplies
 * the top layer, light dismiss, Esc and focus return. This component adds state, one setter
 * every close goes through, and the arrow-key focus a menu needs (`core/rovingFocus`).
 *
 * Each Item registers its own `disabled` from its props; the Root never reads it back from
 * the DOM (decision 10). Elements are kept only to move focus to.
 */
export function MenuRoot({
  open: openProp,
  defaultOpen,
  onOpenChange,
  focusableWhenDisabled = false,
  children,
}: MenuRootProps) {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name: 'Menu.Root',
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

  const [items, setItems] = useState<MenuItemEntry[]>([]);
  const register = useCallback((entry: MenuItemEntry) => {
    setItems((current) => [...current, entry].sort(byDocumentOrder));
    return () => setItems((current) => current.filter((i) => i !== entry));
  }, []);

  const navigableItems = useMemo(
    () => (focusableWhenDisabled ? items : items.filter((i) => !i.disabled)),
    [items, focusableWhenDisabled],
  );

  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusOnOpenRef = useRef<MenuFocusOnOpen>('first');

  const context: MenuRootContextValue = useMemo(
    () => ({
      open,
      setOpen,
      navigableItems,
      focusableWhenDisabled,
      register,
      focusOnOpenRef,
      triggerId: `${id}-trigger`,
      popupId: `${id}-popup`,
      anchorName: anchorNameFor(id),
      triggerRef,
    }),
    [open, setOpen, navigableItems, focusableWhenDisabled, register, id],
  );

  return <MenuRootContext.Provider value={context}>{children}</MenuRootContext.Provider>;
}
