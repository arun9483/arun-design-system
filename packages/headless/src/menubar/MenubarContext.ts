import { createContext, useContext } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import type { Orientation } from '../core/rovingFocus';
import type { MenuFocusOnOpen } from '../menu/MenuRootContext';

/** A menu of the bar, as the Root knows it: its Trigger registers it from its props. */
export type MenubarEntry = {
  /** The Trigger: the bar item, and what the arrow keys move focus to. */
  ref: RefObject<HTMLElement | null>;
  disabled: boolean;
  /** What typeahead matches: the text in the Trigger's children. */
  textValue: string;
  open: boolean;
  /** Opens the menu, moving focus into it as `focus` says. */
  show: (focus: MenuFocusOnOpen) => void;
  hide: () => void;
};

/** What the bar's Triggers and Popups need from its Root. */
export type MenubarContextValue = {
  orientation: Orientation;
  focusableWhenDisabled: boolean;
  register: (entry: MenubarEntry) => () => void;
  /** Whether this Trigger holds the bar's Tab stop. */
  isTabStop: (ref: RefObject<HTMLElement | null>) => boolean;
  setTabStop: (ref: RefObject<HTMLElement | null>) => void;
  /**
   * A key pressed on a Trigger: the arrow keys along the bar, Home, End and typeahead move to
   * another Trigger. Returns whether the key was the bar's.
   */
  onTriggerKeyDown: (event: ReactKeyboardEvent, ref: RefObject<HTMLElement | null>) => boolean;
  /**
   * From inside an open menu: moves to the next or previous menu of the bar and opens it at its
   * first item. Returns whether there was another menu to move to.
   */
  moveFromMenu: (ref: RefObject<HTMLElement | null>, step: 1 | -1) => boolean;
  /** The pointer moved on a Trigger. While another menu is open, this one opens in its place. */
  onTriggerPointerMove: (ref: RefObject<HTMLElement | null>) => void;
};

export const MenubarContext = createContext<MenubarContextValue | null>(null);

export function useMenubarContext(part: string): MenubarContextValue {
  const context = useContext(MenubarContext);
  if (context === null) {
    throw new Error(`<Menubar.${part}> must be rendered inside <Menubar.Root>.`);
  }
  return context;
}
