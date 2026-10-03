import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/** The state Menu.Root shares with its parts, and projects as `data-*` attributes. */
export type MenuState = {
  open: boolean;
};

/** An item as the Root knows it: its props, and its element only to move focus to. */
export type MenuItemEntry = {
  disabled: boolean;
  /** What typeahead matches: `textValue`, or the text in its children. */
  textValue: string;
  ref: RefObject<HTMLElement | null>;
};

/** Which item takes focus when the menu opens: Up on the Trigger opens at the last. */
export type MenuFocusOnOpen = 'first' | 'last';

/** What the parts need from the Root beyond its state. */
export type MenuRootContextValue = MenuState & {
  /** Every open and close goes through here — Trigger, Item, Tab, Esc, light dismiss. */
  setOpen: (open: boolean) => void;
  /** The items the arrow keys reach, in document order. */
  navigableItems: MenuItemEntry[];
  focusableWhenDisabled: boolean;
  register: (entry: MenuItemEntry) => () => void;
  /** Set by the Trigger just before it opens the menu; read by the Popup once shown. */
  focusOnOpenRef: RefObject<MenuFocusOnOpen>;
  triggerId: string;
  popupId: string;
  /** `--hl-anchor-<id>`: the trigger's `anchor-name` and the popup's `position-anchor`. */
  anchorName: string;
  /** The trigger, passed as `source` to `showPopover()` so it becomes the invoker. */
  triggerRef: RefObject<HTMLElement | null>;
};

export const MenuRootContext = createContext<MenuRootContextValue | null>(null);

export function useMenuRootContext(part: string): MenuRootContextValue {
  const context = useContext(MenuRootContext);

  if (context === null) {
    throw new Error(`<Menu.${part}> must be rendered inside <Menu.Root>.`);
  }

  return context;
}
