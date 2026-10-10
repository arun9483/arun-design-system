'use client';

import { useEffect, useReducer, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import {
  anchoredDataAttributes,
  anchoredPopupStyle,
  type AnchorAlign,
  type AnchorSide,
  type PopoverElement,
} from '../core/anchoring';
import { rovingIndex } from '../core/rovingFocus';
import { typeaheadIndex, useTypeahead } from '../core/typeahead';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuRootContext } from './MenuRootContext';
import { menuDataAttributes } from './menuDataAttributes';

export type MenuSide = AnchorSide;
export type MenuAlign = AnchorAlign;

type MenuPopupOwnProps = {
  /**
   * Which side of the trigger to open on. Flips to the opposite side when there is no room.
   * Defaults to `'bottom'`, and to `'right'` in a submenu.
   */
  side?: MenuSide;
  /** Where along that side: flush with the trigger's start or end edge, or centred on it. */
  align?: MenuAlign;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuPopupProps = MenuPopupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof MenuPopupOwnProps | 'popover'>;

/**
 * The menu: a native `popover="auto"` with `role="menu"`, anchored to the Trigger as
 * Popover's popup is (decision 12), and labelled by it.
 *
 * Opening moves focus to the first item — the last, when Up on the Trigger opened it. Up
 * and Down then move between items, wrapping, with Home and End; typing moves to the next item
 * whose text starts with what was typed. Disabled items are skipped by both, unless the Root
 * sets `focusableWhenDisabled`. Tab closes the menu and lets focus move on.
 *
 * Inside a SubmenuRoot it is that submenu's popup: it opens beside its SubmenuTrigger, ← (→ in
 * a right-to-left menu) closes it, and Tab closes every level. Closing with focus inside returns
 * it to the SubmenuTrigger.
 *
 * Light dismiss and Esc close the element before anyone is asked; the `toggle` event
 * reports it through the Root, and the element reopens if the state stays open. Focus
 * returns to the Trigger, the invoker, whenever the menu hides with focus inside it.
 */
export function MenuPopup({
  side: sideProp,
  align = 'start',
  className,
  children,
  render,
  ...rest
}: MenuPopupProps) {
  const {
    open,
    setOpen,
    navigableItems,
    focusOnOpenRef,
    triggerId,
    popupId,
    anchorName,
    triggerRef,
    parent,
    popupRef: elementRef,
    openSubmenuRef,
  } = useMenuRootContext('Popup');
  const side = sideProp ?? (parent ? 'right' : 'bottom');
  // Set when the menu is shown; cleared once an item has taken focus. Items register in
  // effects, so on the first open they may arrive a render after the popup is shown.
  const focusPendingRef = useRef(false);
  // Re-runs the sync after the element closed itself, in case the state did not follow.
  const [, resync] = useReducer((n: number) => n + 1, 0);
  const typeahead = useTypeahead();

  // Runs after every render: cheap, and it keeps element and state in step whichever of
  // them moved.
  useEffect(() => {
    const popup = elementRef.current;
    // jsdom, or a `render` element without the API: nothing to drive.
    if (!popup || typeof popup.showPopover !== 'function') return;

    const shown = popup.matches(':popover-open');
    if (open && !shown) {
      // Older engines ignore the options object and show it without the invoker link.
      (popup as PopoverElement).showPopover({ source: triggerRef.current ?? undefined });
      // A `beforetoggle` listener can cancel the open. Then it is a refused open: report
      // it, so the state — and the Trigger's aria-expanded — follow the element.
      if (!popup.matches(':popover-open')) setOpen(false);
      else focusPendingRef.current = true;
    } else if (!open && shown) {
      focusPendingRef.current = false;
      popup.hidePopover();
    }

    if (focusPendingRef.current && navigableItems.length > 0) {
      focusPendingRef.current = false;
      const focus = focusOnOpenRef.current;
      const target =
        focus === 'last' ? navigableItems.at(-1) : focus === 'first' ? navigableItems[0] : null;
      target?.ref.current?.focus();
    }
  });

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: popupId,
      popover: 'auto',
      role: 'menu',
      'aria-labelledby': triggerId,
      ...anchoredDataAttributes(side, align),
      ...menuDataAttributes({ open }),
      style: anchoredPopupStyle(anchorName, side, align),
      className,
      children,
      ref: elementRef,
      onKeyDown(event: ReactKeyboardEvent) {
        if (event.key === 'Tab') {
          // Not prevented: the menu closes, focus returns to the Trigger, and Tab moves on
          // from there — to what follows the menu button.
          setOpen(false);
          return;
        }
        const current = navigableItems.findIndex((i) => i.ref.current === event.target);
        // Only from an item of this menu, or the menu itself: a nested widget's keys are its own,
        // and so are a submenu's, whose items are inside this element too.
        if (current < 0 && event.target !== event.currentTarget) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        if (parent && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
          // Back to the parent: the platform returns focus to the SubmenuTrigger, the invoker.
          event.preventDefault();
          setOpen(false);
          return;
        }
        const search = typeahead(event);
        const next =
          search === null
            ? rovingIndex(event.key, {
                count: navigableItems.length,
                current,
                orientation: 'vertical',
                rtl: false,
              })
            : typeaheadIndex(
                navigableItems.map((i) => i.textValue),
                current,
                search,
              );
        // A typed key is the search's, matched or not: a Space in one must not activate.
        if (search !== null) event.preventDefault();
        if (next === null) return;
        event.preventDefault();
        const target = navigableItems[next]?.ref.current;
        // Leaving a SubmenuTrigger for another item closes the submenu it opened.
        const submenu = openSubmenuRef.current;
        if (submenu && submenu.triggerRef.current !== target) submenu.close();
        target?.focus();
      },
      onBeforeToggle(event: SyntheticEvent) {
        if (event.target !== event.currentTarget || !parent) return;
        if ((event.nativeEvent as ToggleEvent).newState !== 'closed') return;
        // The platform returns focus only for the outermost auto popover, never a nested one, so
        // a submenu closing with focus inside hands it back to its SubmenuTrigger itself.
        if (event.currentTarget.contains(document.activeElement)) triggerRef.current?.focus();
      },
      onToggle(event: SyntheticEvent) {
        // React carries a nested popover's toggle up the component tree; it isn't ours.
        if (event.target !== event.currentTarget) return;
        if ((event.nativeEvent as ToggleEvent).newState !== 'closed') return;
        // Light dismiss or Esc closed it. Report it; if the state stays open, reopen.
        setOpen(false);
        resync();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
