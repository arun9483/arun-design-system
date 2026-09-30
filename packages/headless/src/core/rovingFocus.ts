/**
 * Roving focus for composite widgets — one Tab stop for the group, arrow keys within it.
 * Tabs first; Menu and Toolbar reuse it. Internal: shared between components, not exported
 * (decision 9).
 *
 * The caller owns the list of items and which are enabled — from component props, never
 * read back from the DOM (decision 10). This only answers "where does this key go".
 */

export type Orientation = 'horizontal' | 'vertical';

/**
 * Sorts registered items into document order. Items register from effects, which can run
 * out of order — an item inserted later registers last but may sit between two others.
 */
export function byDocumentOrder(
  a: { ref: { current: HTMLElement | null } },
  b: { ref: { current: HTMLElement | null } },
): number {
  const x = a.ref.current;
  const y = b.ref.current;
  if (!x || !y) return 0;
  return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * The index a key moves focus to, among `count` enabled items, from `current` (-1 when
 * focus is on none of them), or `null` when the key is not a navigation key here.
 *
 * Arrows follow the orientation and wrap at the ends; Home and End go to the first and last.
 * In a right-to-left horizontal group the next item sits to the left, so Left and Right swap:
 * the arrows follow what the user sees.
 */
export function rovingIndex(
  key: string,
  {
    count,
    current,
    orientation,
    rtl,
  }: { count: number; current: number; orientation: Orientation; rtl: boolean },
): number | null {
  if (count === 0) return null;

  const [prevKey, nextKey] =
    orientation === 'vertical'
      ? ['ArrowUp', 'ArrowDown']
      : rtl
        ? ['ArrowRight', 'ArrowLeft']
        : ['ArrowLeft', 'ArrowRight'];

  switch (key) {
    case nextKey:
      return current < 0 ? 0 : (current + 1) % count;
    case prevKey:
      return current < 0 ? count - 1 : (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
