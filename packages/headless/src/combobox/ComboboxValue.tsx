'use client';

import type { ReactNode } from 'react';
import { useComboboxRootContext } from './ComboboxRootContext';

export type ComboboxValueProps<T = unknown> = {
  /**
   * Renders the selection: `T | null`, or `T[]` with `multiple`. The Root's `itemToString` is
   * passed along for labels — a chip's text, say.
   */
  children: (value: T, details: { itemToString: (item: unknown) => string }) => ReactNode;
};

/**
 * The current selection, for whatever shows it outside the input — chips, most often. Renders
 * no element of its own.
 *
 * It exists so that a separate styling package can show the selection without owning a copy
 * of it (decision 9): the value stays the Root's.
 */
export function ComboboxValue<T = unknown>({ children }: ComboboxValueProps<T>) {
  const { multiple, selectedItems, itemToString } = useComboboxRootContext('Value');
  const value = (multiple ? selectedItems : (selectedItems[0] ?? null)) as T;
  return <>{children(value, { itemToString })}</>;
}
