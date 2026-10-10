'use client';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { anchorNameFor } from '../core/anchoring';
import type { Point } from '../core/pointerIntent';
import { byDocumentOrder } from '../core/rovingFocus';
import { useControlled } from '../core/useControlled';
import {
  MenuRootContext,
  type MenuFocusOnOpen,
  type MenuItemEntry,
  type MenuRootContextValue,
  type OpenSubmenu,
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
export function MenuRoot({ children, ...props }: MenuRootProps) {
  const context = useMenuRootValue('Menu.Root', props, null);
  return <MenuRootContext.Provider value={context}>{children}</MenuRootContext.Provider>;
}

/**
 * The state and context of a menu — Root's, and a SubmenuRoot's, which passes the menu it is
 * nested in as `parent`.
 */
export function useMenuRootValue(
  name: string,
  {
    open: openProp,
    defaultOpen,
    onOpenChange,
    focusableWhenDisabled = false,
  }: Omit<MenuRootProps, 'children'>,
  parent: MenuRootContextValue | null,
): MenuRootContextValue {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name,
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

  const closeAll = useCallback(() => {
    setOpen(false);
    parent?.closeAll();
  }, [setOpen, parent]);

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
  const popupRef = useRef<HTMLElement | null>(null);
  const openSubmenuRef = useRef<OpenSubmenu | null>(null);
  const graceRef = useRef<{ area: Point[]; until: number } | null>(null);

  return useMemo(
    () => ({
      open,
      setOpen,
      closeAll,
      navigableItems,
      focusableWhenDisabled,
      register,
      focusOnOpenRef,
      triggerId: `${id}-trigger`,
      popupId: `${id}-popup`,
      anchorName: anchorNameFor(id),
      triggerRef,
      parent,
      popupRef,
      openSubmenuRef,
      graceRef,
    }),
    [open, setOpen, closeAll, navigableItems, focusableWhenDisabled, register, id, parent],
  );
}
