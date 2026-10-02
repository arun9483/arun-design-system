import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/** Why a value, the input's text or the open state changed — the second callback argument. */
export type ComboboxChangeReason =
  | 'input'
  | 'input-press'
  | 'trigger-press'
  | 'item-press'
  | 'keyboard'
  | 'clear'
  | 'chip-remove'
  | 'escape'
  | 'outside-press'
  | 'blur'
  | 'form-reset';

export type ComboboxChangeDetails = { reason: ComboboxChangeReason };

/** Why the highlighted item changed: arrow keys, the pointer, or the component itself. */
export type ComboboxHighlightReason = 'keyboard' | 'pointer' | 'none';

export type ComboboxHighlightDetails = { index: number; reason: ComboboxHighlightReason };

/** The state Combobox.Root shares with its parts, and projects as `data-*` attributes. */
export type ComboboxState = {
  open: boolean;
  multiple: boolean;
  disabled: boolean;
};

export type Highlight = { index: number; reason: ComboboxHighlightReason };

/**
 * The highlighted index, outside React state. Moving the highlight is the most frequent
 * change — every arrow key and pointer move — and each Item subscribes to whether it alone
 * is highlighted, so a move re-renders two items rather than the whole list.
 */
export type HighlightStore = {
  get: () => Highlight;
  set: (next: Highlight) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createHighlightStore(): HighlightStore {
  let current: Highlight = { index: -1, reason: 'none' };
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    set(next) {
      if (next.index === current.index && next.reason === current.reason) return;
      current = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** A Chip as the Root knows it: its item, and its element only to move focus to. */
export type ComboboxChipEntry = {
  key: string;
  ref: RefObject<HTMLElement | null>;
};

/** What the parts need from the Root beyond its state. Items are `unknown` here: `T` is the consumer's. */
export type ComboboxRootContextValue = ComboboxState & {
  required: boolean;
  inputValue: string;
  loading: boolean;
  /** The items the List renders, after filtering. */
  filteredItems: readonly unknown[];
  itemToString: (item: unknown) => string;
  itemToKey: (item: unknown) => string;
  /** Index of each filtered item by key, so an Item finds its own without a search. */
  indexByKey: ReadonlyMap<string, number>;
  /** Keys of the selected items. */
  selectedKeys: ReadonlySet<string>;
  /** Keys of items disabled by their Item's props — read when the arrow keys move. */
  disabledKeys: Set<string>;
  highlight: HighlightStore;
  setHighlight: (index: number, reason: ComboboxHighlightReason) => void;
  setOpen: (open: boolean, reason: ComboboxChangeReason) => void;
  setInputValue: (value: string, reason: ComboboxChangeReason) => void;
  /** Selects or, with `multiple`, toggles an item: Item clicks and Enter. */
  select: (item: unknown) => void;
  /** Removes one item from a multiple selection: a Chip, ChipRemove or Backspace. */
  remove: (item: unknown, reason: ComboboxChangeReason) => void;
  /** Empties the selection: `null`, or `[]` with `multiple`. */
  clearSelection: (reason: ComboboxChangeReason) => void;
  /** Empties the input and the selection: the Clear button. */
  clear: () => void;
  /** Closes, and puts the input back: the selected label, or empty with `multiple`. */
  close: (reason: ComboboxChangeReason) => void;
  /** Selected items, for chips and Backspace. */
  selectedItems: readonly unknown[];
  registerChip: (entry: ComboboxChipEntry) => () => void;
  /**
   * Elements a press on does not close the list from outside: Trigger and Clear. The input,
   * the popup and the chips are known already.
   */
  registerInside: (ref: RefObject<HTMLElement | null>) => () => void;
  isInside: (node: Node) => boolean;
  /** Whether an InputGroup is the anchor; without one, the Input is. */
  hasGroup: boolean;
  registerGroup: () => () => void;
  chips: ComboboxChipEntry[];
  onLoadMore: (() => void) | undefined;
  inputId: string;
  listId: string;
  optionId: (index: number) => string;
  /** `--hl-anchor-<id>`: the input's `anchor-name` and the popup's `position-anchor`. */
  anchorName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  popupRef: RefObject<HTMLElement | null>;
};

export const ComboboxRootContext = createContext<ComboboxRootContextValue | null>(null);

export function useComboboxRootContext(part: string): ComboboxRootContextValue {
  const context = useContext(ComboboxRootContext);

  if (context === null) {
    throw new Error(`<Combobox.${part}> must be rendered inside <Combobox.Root>.`);
  }

  return context;
}
