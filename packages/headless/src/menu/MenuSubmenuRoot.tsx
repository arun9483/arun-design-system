import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useMenuRootValue } from './MenuRoot';
import { MenuRootContext, useMenuRootContext } from './MenuRootContext';

export type MenuSubmenuRootProps = {
  /**
   * Controlled state. Provide `onOpenChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Menu.Root.
   */
  open?: boolean;
  /** Initial state when uncontrolled. Read once, at mount. */
  defaultOpen?: boolean;
  /**
   * Called on every request to open or close — its SubmenuTrigger, the arrow keys, an Item,
   * Esc, a click elsewhere, or the pointer moving to another item of the parent menu.
   */
  onOpenChange?: (open: boolean) => void;
  /** As on Menu.Root. Defaults to the parent menu's setting. */
  focusableWhenDisabled?: boolean;
  children?: ReactNode;
};

/**
 * A menu inside a menu: holds the submenu's state, as Root does, and renders no element. Put a
 * SubmenuTrigger and a Popup inside it; the Popup opens beside the trigger, on the right by
 * default.
 *
 * The popup is a native `popover="auto"` shown with the trigger as its `source`, which nests it
 * in the parent's popover: the parent stays open while it is, Esc closes one level at a time,
 * a click in the parent closes only the submenu, and focus returns to the trigger — all the
 * platform's. Activating an item closes every level.
 */
export function MenuSubmenuRoot({
  focusableWhenDisabled,
  children,
  ...props
}: MenuSubmenuRootProps) {
  const parent = useMenuRootContext('SubmenuRoot');
  const context = useMenuRootValue(
    'Menu.SubmenuRoot',
    { ...props, focusableWhenDisabled: focusableWhenDisabled ?? parent.focusableWhenDisabled },
    parent,
  );
  const { open, setOpen, triggerRef } = context;
  const { openSubmenuRef } = parent;

  // Tells the parent which submenu is open, so moving to another of its items closes it.
  useEffect(() => {
    if (!open) return;
    const entry = { close: () => setOpen(false), triggerRef };
    openSubmenuRef.current = entry;
    return () => {
      if (openSubmenuRef.current === entry) openSubmenuRef.current = null;
    };
  }, [open, setOpen, triggerRef, openSubmenuRef]);

  return <MenuRootContext.Provider value={context}>{children}</MenuRootContext.Provider>;
}
