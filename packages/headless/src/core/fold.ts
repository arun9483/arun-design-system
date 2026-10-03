/**
 * Folds case and accents, so "e" matches "É" and "ü" matches "U": decompose to base letters
 * and combining marks, drop the marks, lower-case what is left. Combobox's filter and Menu's
 * typeahead compare text through it. Internal (decision 9).
 */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}
