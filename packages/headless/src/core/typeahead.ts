import { Children, isValidElement, useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { fold } from './fold';

/**
 * Typeahead for a list of items: typing moves focus to the next item whose text starts with
 * what was typed. Menu first; internal (decision 9). Like `rovingFocus`, it only answers
 * "where does this go" — the caller owns the items, their text, and focus.
 */

/** Characters typed within this long of each other build one search; after it, a new one. */
export const TYPEAHEAD_TIMEOUT = 500;

/**
 * An item's text, from its props (decision 10): the strings in its children, depth first,
 * through elements' own `children`. A component that renders its text itself is opaque here,
 * so such an item needs `textValue`.
 */
export function textOf(node: ReactNode): string {
  let text = '';
  Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') text += child;
    else if (isValidElement<{ children?: ReactNode }>(child)) text += textOf(child.props.children);
  });
  return text;
}

/**
 * The index the search moves focus to among `labels`, from `current` (-1 when focus is on none),
 * or `null` when no item matches. Compared by prefix, ignoring case and accents, wrapping.
 *
 * One character moves past the current item, so typing "d" again goes to the next "d…" item; a
 * longer search may stay on it, since "de" should not leave "Delete" for "Deploy". The same
 * character repeated ("ddd") cycles too, as it does in native menus and `<select>`.
 */
export function typeaheadIndex(labels: readonly string[], current: number, search: string) {
  const count = labels.length;
  if (count === 0 || search === '') return null;
  const [first = '', ...others] = [...search];
  const repeated = others.every((char) => char === first);
  const needle = fold(repeated ? first : search);
  const start = current < 0 ? 0 : repeated ? current + 1 : current;
  for (let step = 0; step < count; step += 1) {
    const index = (start + step) % count;
    if (fold(labels[index] ?? '').startsWith(needle)) return index;
  }
  return null;
}

/**
 * The search being typed. The function it returns adds a printable key and returns the search so
 * far, or `null` when the key is not part of one — a modifier held, a named key, or a Space
 * that starts nothing (it activates the item, as on any button). A Space inside a search
 * continues it, so "New f" can reach "New folder".
 */
export function useTypeahead() {
  const searchRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback((event: ReactKeyboardEvent) => {
    const { key } = event;
    if (event.ctrlKey || event.metaKey || event.altKey) return null;
    if ([...key].length !== 1) return null;
    if (key === ' ' && searchRef.current === '') return null;
    searchRef.current += key;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      searchRef.current = '';
    }, TYPEAHEAD_TIMEOUT);
    return searchRef.current;
  }, []);
}
