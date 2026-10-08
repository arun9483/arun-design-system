import { useCallback, useMemo, useState } from 'react';
import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
  RefObject,
} from 'react';
import { byDocumentOrder, rovingIndex, type Orientation } from '../core/rovingFocus';
import { typeaheadIndex, useTypeahead } from '../core/typeahead';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import type { MenuFocusOnOpen } from '../menu/MenuRootContext';
import { MenubarContext, type MenubarContextValue, type MenubarEntry } from './MenubarContext';

type MenubarRootOwnProps = {
  /**
   * Which arrow keys move along the bar. A vertical bar opens its menus with → (← in a
   * right-to-left bar), and its Popups default to `side="right"`.
   */
  orientation?: Orientation;
  /**
   * Keeps disabled Triggers in the arrow-key sequence, so a screen reader announces them as
   * unavailable. They still cannot open. Off by default: the arrows skip them.
   */
  focusableWhenDisabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenubarRootProps = MenubarRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof MenubarRootOwnProps>;

/**
 * A bar of menus, by the WAI-ARIA menubar pattern (decision 29): `role="menubar"` around
 * `Menubar.Menu`s, whose Triggers are its items. One Tab stop; the arrow keys move along the
 * bar, Home and End go to its ends, and typing moves to the Trigger whose text starts with it.
 *
 * While a menu is open, moving along the bar — by key, or the pointer reaching another Trigger —
 * opens the menu reached in its place. Name it with `aria-label`.
 */
export function MenubarRoot({
  orientation = 'horizontal',
  focusableWhenDisabled = false,
  className,
  children,
  render,
  ...rest
}: MenubarRootProps) {
  const [entries, setEntries] = useState<MenubarEntry[]>([]);
  const register = useCallback((entry: MenubarEntry) => {
    setEntries((current) => [...current, entry].sort(byDocumentOrder));
    return () => setEntries((current) => current.filter((e) => e !== entry));
  }, []);

  const navigable = useMemo(
    () => (focusableWhenDisabled ? entries : entries.filter((e) => !e.disabled)),
    [entries, focusableWhenDisabled],
  );

  // Before anything has had focus, the Tab stop is the first Trigger the arrow keys reach.
  const [chosen, setChosen] = useState<RefObject<HTMLElement | null> | null>(null);
  const tabStop =
    (chosen && navigable.find((e) => e.ref === chosen)?.ref) ?? navigable[0]?.ref ?? null;

  const typeahead = useTypeahead();

  // The one way focus moves along the bar: the open menu closes, focus moves to `target`, and
  // its menu opens when `focus` says how — `null` leaves it closed. A disabled menu never opens.
  const goTo = useCallback(
    (target: MenubarEntry, focus: MenuFocusOnOpen | null) => {
      for (const entry of entries) if (entry.open && entry !== target) entry.hide();
      target.ref.current?.focus();
      setChosen(target.ref);
      if (focus !== null && !target.disabled) target.show(focus);
    },
    [entries],
  );

  const context: MenubarContextValue = useMemo(
    () => ({
      orientation,
      focusableWhenDisabled,
      register,
      isTabStop: (ref) => ref === tabStop,
      setTabStop: setChosen,
      onTriggerKeyDown(event: ReactKeyboardEvent, ref) {
        const current = navigable.findIndex((e) => e.ref === ref);
        // Leaving a Trigger whose menu is open keeps a menu open: the one reached.
        const keepOpen: MenuFocusOnOpen | null = navigable[current]?.open ? 'none' : null;
        const search = typeahead(event);
        if (search !== null) {
          // A typed key is the search's, matched or not: a Space in one must not open a menu.
          event.preventDefault();
          const next = typeaheadIndex(
            navigable.map((e) => e.textValue),
            current,
            search,
          );
          const target = next === null ? undefined : navigable[next];
          if (target) goTo(target, keepOpen);
          return true;
        }
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const next = rovingIndex(event.key, {
          count: navigable.length,
          current,
          orientation,
          rtl,
        });
        const target = next === null ? undefined : navigable[next];
        if (!target) return false;
        event.preventDefault();
        goTo(target, keepOpen);
        return true;
      },
      moveFromMenu(ref, step) {
        const count = navigable.length;
        const current = navigable.findIndex((e) => e.ref === ref);
        if (current < 0 || count < 2) return false;
        const target = navigable[(current + step + count) % count];
        if (!target) return false;
        goTo(target, 'first');
        return true;
      },
      onTriggerPointerEnter(ref) {
        const open = entries.find((e) => e.open);
        const target = entries.find((e) => e.ref === ref);
        if (!open || !target || open === target || target.disabled) return;
        // Focus follows, so the keyboard carries on from the menu now open.
        goTo(target, 'none');
      },
    }),
    [orientation, focusableWhenDisabled, register, tabStop, navigable, typeahead, goTo, entries],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'menubar',
      'aria-orientation': orientation,
      'data-orientation': orientation,
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });

  return <MenubarContext.Provider value={context}>{element}</MenubarContext.Provider>;
}
