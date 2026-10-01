/**
 * Folds case and accents, so "e" matches "É" and "ü" matches "U": decompose to base letters
 * and combining marks, drop the marks, lower-case what is left.
 */
function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

/**
 * Combobox's default filter: the items whose label contains the query, ignoring case and
 * accents, in their original order. An empty query keeps every item.
 *
 * Exported so a consumer's own filter can fall back to it, or narrow with it first.
 */
export function defaultFilter<T>(
  items: readonly T[],
  query: string,
  itemToString: (item: T) => string,
): T[] {
  const needle = fold(query.trim());
  if (needle === '') return [...items];
  return items.filter((item) => fold(itemToString(item)).includes(needle));
}
