'use client';

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import { byDocumentOrder, rovingIndex } from './rovingFocus';
import type { Orientation } from './rovingFocus';

/**
 * A roving group: one Tab stop, the arrow keys between its items. Toolbar and ToggleGroup;
 * internal, not exported (decision 9). Items register from their props — `disabled` included —
 * never read back from the DOM (decision 10). A ToggleGroup inside a Toolbar joins the
 * Toolbar's group rather than starting its own, so the whole toolbar is one Tab stop.
 */

/** `selected` — a pressed Toggle — is where the Tab stop starts, before anything has had focus. */
export type RovingItem = {
  ref: RefObject<HTMLElement | null>;
  disabled: boolean;
  selected: boolean;
};

export type RovingGroupValue = {
  /** The item holding the Tab stop. */
  tabStop: RovingItem | null;
  register: (item: RovingItem) => () => void;
  setTabStop: (item: RovingItem) => void;
};

export const RovingGroupContext = createContext<RovingGroupValue | null>(null);

export function useRovingGroupContext(): RovingGroupValue | null {
  return useContext(RovingGroupContext);
}

/** Text fields keep Left, Right, Home and End for their caret, until it is at the edge. */
function keyBelongsToField(event: ReactKeyboardEvent, orientation: Orientation): boolean {
  const target = event.target as HTMLElement;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return false;
  if (
    target instanceof HTMLInputElement &&
    !/^(text|search|url|tel|email|password|number)$/.test(target.type)
  ) {
    return false;
  }
  const { key } = event;
  const along = orientation === 'horizontal' ? ['ArrowLeft', 'ArrowRight', 'Home', 'End'] : [];
  if (!along.includes(key)) return false;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? 0;
  const atStart = start === 0 && end === 0;
  const atEnd = start === target.value.length && end === target.value.length;
  const rtl = getComputedStyle(target).direction === 'rtl';
  const towardStart = key === (rtl ? 'ArrowRight' : 'ArrowLeft') || key === 'Home';
  return towardStart ? !atStart : !atEnd;
}

/**
 * The group's state, for its root: the context to provide and the key handler to attach. Before
 * anything has had focus, the Tab stop is the first selected item, else the first enabled one.
 */
export function useRovingGroup({ orientation }: { orientation: Orientation }) {
  const [items, setItems] = useState<RovingItem[]>([]);
  const register = useCallback((item: RovingItem) => {
    setItems((current) => [...current, item].sort(byDocumentOrder));
    return () => setItems((current) => current.filter((i) => i !== item));
  }, []);
  const [chosen, setTabStop] = useState<RovingItem | null>(null);

  const enabled = items.filter((item) => !item.disabled);
  const tabStop =
    // Matched by element: an item re-registers when its props change.
    (chosen && enabled.find((item) => item.ref === chosen.ref)) ||
    enabled.find((item) => item.selected) ||
    enabled[0] ||
    null;

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented || keyBelongsToField(event, orientation)) return;
      const current = enabled.findIndex((item) => item.ref.current?.contains(event.target as Node));
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const next = rovingIndex(event.key, { count: enabled.length, current, orientation, rtl });
      if (next === null) return;
      const item = enabled[next];
      if (!item) return;
      event.preventDefault();
      item.ref.current?.focus();
      setTabStop(item);
    },
    [enabled, orientation],
  );

  const context = useMemo(() => ({ tabStop, register, setTabStop }), [tabStop, register]);
  return { context, onKeyDown };
}

/**
 * An item's part in its group: registered while mounted, and the `tabIndex` and `onFocus` that
 * keep the Tab stop on it once it has focus. Outside a group it is an ordinary focusable element.
 */
export function useRovingItem(
  ref: RefObject<HTMLElement | null>,
  disabled: boolean,
  selected = false,
) {
  const group = useRovingGroupContext();
  const item = useMemo(() => ({ ref, disabled, selected }), [ref, disabled, selected]);
  const register = group?.register;
  useLayoutEffect(() => register?.(item), [register, item]);
  if (!group) return { tabIndex: undefined, onFocus: undefined };
  return {
    tabIndex: group.tabStop?.ref === ref ? 0 : -1,
    onFocus() {
      group.setTabStop(item);
    },
  };
}
