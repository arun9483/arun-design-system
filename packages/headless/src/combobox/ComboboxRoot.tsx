import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLatest } from '../core/useLatest';
import type { ReactNode, RefObject } from 'react';
import { anchorNameFor } from '../core/anchoring';
import { byDocumentOrder } from '../core/rovingFocus';
import { useControlled } from '../core/useControlled';
import { defaultFilter } from './defaultFilter';
import {
  ComboboxRootContext,
  createHighlightStore,
  type ComboboxChangeDetails,
  type ComboboxChangeReason,
  type ComboboxChipEntry,
  type ComboboxHighlightDetails,
  type ComboboxHighlightReason,
  type ComboboxRootContextValue,
} from './ComboboxRootContext';

/** The selection: one item or `null`, or an array with `multiple`. */
export type ComboboxValue<T, Multiple extends boolean> = Multiple extends true ? T[] : T | null;

/** Takes the whole list, so a filter can rank as well as narrow — a fuzzy search, say. */
export type ComboboxFilter<T> = (
  items: readonly T[],
  query: string,
  itemToString: (item: T) => string,
) => T[];

/**
 * Items under a label, as an `<optgroup>`: any object with an `items` array — the rest, a
 * label or an id, is yours to render.
 */
export type ComboboxGroup<T> = { readonly items: readonly T[] };

export type ComboboxRootProps<T, Multiple extends boolean = false> = {
  /**
   * Every item the list can show. With server search, the current results. Or groups of
   * them: each an object with an `items` array, which the filter searches and `List` renders
   * one by one, leaving out the groups with no match.
   */
  items: readonly T[] | readonly ComboboxGroup<T>[];
  /**
   * An item's label: what the input shows once it is picked, and what the default filter
   * matches. Defaults to the item itself for strings, else its `label` property.
   */
  itemToString?: (item: T) => string;
  /**
   * An item's identity: how a selected item is recognised when `items` is a fresh array,
   * and the value the form submits. Defaults to `itemToString`.
   */
  itemToKey?: (item: T) => string;
  /**
   * Narrows `items` to what matches the input's text. Omitted, a case- and accent-insensitive
   * "contains" on each label. `null` turns filtering off — `items` are shown as given, which
   * is what a server search that fills them per query wants.
   */
  filter?: ComboboxFilter<T> | null;
  /** Lets more than one item be selected. `value` is then an array. */
  multiple?: Multiple;
  /**
   * Controlled selection. Provide `onValueChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount. Use `null` — or `[]` with
   * `multiple` — for nothing selected.
   */
  value?: ComboboxValue<T, Multiple>;
  /** Initial selection when uncontrolled. Read once, at mount. */
  defaultValue?: ComboboxValue<T, Multiple>;
  onValueChange?: (value: ComboboxValue<T, Multiple>, details: ComboboxChangeDetails) => void;
  /** Controlled text of the input. Provide `onInputValueChange` alongside it. */
  inputValue?: string;
  /** Initial text when uncontrolled. Defaults to the selected item's label, without `multiple`. */
  defaultInputValue?: string;
  /** Called on every change of the input's text — typing, a pick, Clear, or a close. */
  onInputValueChange?: (inputValue: string, details: ComboboxChangeDetails) => void;
  /** Controlled open state. Provide `onOpenChange` alongside it. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: ComboboxChangeDetails) => void;
  /**
   * Called when the highlighted item changes, with its index in the filtered list. A
   * virtualized list scrolls to that index, since the highlighted option must be rendered
   * for the input's `aria-activedescendant` to reach it.
   */
  onItemHighlighted?: (item: T | undefined, details: ComboboxHighlightDetails) => void;
  /** Called when the end of the list scrolls into view and `loading` is not set. */
  onLoadMore?: () => void;
  /** More items are on their way: the list is `aria-busy`, and `Empty` stays hidden. */
  loading?: boolean;
  /** Disables the input and every button. */
  disabled?: boolean;
  /**
   * Something must be selected before the form submits. The input is `required` while the
   * selection is empty, so the browser's own validation reports it.
   */
  required?: boolean;
  /** Submits each selected item's key under this name, from hidden inputs. */
  name?: string;
  /** Associates the hidden inputs with a `<form>` by id, when rendered outside it. */
  form?: string;
  children?: ReactNode;
};

/** Groups, when every entry has an `items` array — read as an `<optgroup>` each. */
function isGroupList(items: readonly unknown[]): items is readonly ComboboxGroup<unknown>[] {
  return (
    items.length > 0 &&
    items.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        Array.isArray((entry as { items?: unknown }).items),
    )
  );
}

function defaultItemToString(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item !== null && typeof item === 'object' && 'label' in item) return String(item.label);
  return String(item);
}

/**
 * A text input that filters a list of options, by the WAI-ARIA combobox pattern. Holds the
 * state and shares it with its parts. Renders no element of its own, apart from the hidden
 * inputs a form submits.
 *
 * Items are data (decision 14): the Root filters `items`, and `Combobox.List` renders what is
 * left. The selection holds items, not keys, and everything about it — the input's label,
 * `aria-selected`, the form value — comes from `value`, never from `items` (decision 10). A
 * selected item stays selected, labelled and submitted after a search stops returning it.
 *
 * Focus stays in the input; the highlighted option is its `aria-activedescendant`.
 */
export function ComboboxRoot<T, Multiple extends boolean = false>({
  items,
  itemToString: itemToStringProp,
  itemToKey: itemToKeyProp,
  filter,
  multiple: multipleProp,
  value: valueProp,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue,
  onInputValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  onItemHighlighted,
  onLoadMore,
  loading = false,
  disabled = false,
  required = false,
  name,
  form,
  children,
}: ComboboxRootProps<T, Multiple>) {
  const multiple = multipleProp === true;
  const itemToString = (itemToStringProp ?? defaultItemToString) as (item: unknown) => string;
  const itemToKey = (itemToKeyProp ?? itemToString) as (item: unknown) => string;

  const [value, setValueState] = useControlled<unknown>({
    controlled: valueProp,
    default: defaultValue ?? (multiple ? [] : null),
    name: 'Combobox.Root',
    state: 'value',
  });

  const selectedItems: readonly unknown[] = useMemo(
    () => (multiple ? (value as unknown[]) : value == null ? [] : [value]),
    [multiple, value],
  );
  const selectedKeys = useMemo(
    () => new Set(selectedItems.map((item) => itemToKey(item))),
    [selectedItems, itemToKey],
  );
  // The label the input shows for a single selection.
  const selectedLabel = !multiple && selectedItems[0] != null ? itemToString(selectedItems[0]) : '';

  const [inputValue, setInputValueState] = useControlled<string>({
    controlled: inputValueProp,
    default: defaultInputValue ?? selectedLabel,
    name: 'Combobox.Root',
    state: 'inputValue',
  });

  const [open, setOpenState] = useControlled<boolean>({
    controlled: openProp,
    default: defaultOpen ?? false,
    name: 'Combobox.Root',
    state: 'open',
  });

  // While the input still shows the selected label, nothing has been searched for: show
  // every item, not just the one already picked.
  const query = !multiple && inputValue === selectedLabel ? '' : inputValue;
  // Typing stays responsive over a long list: React renders the input first, the filter after.
  const deferredQuery = useDeferredValue(query);

  // With groups, the filter runs inside each, and a group it empties is left out. The arrow
  // keys, the highlight index and Empty all see one flat list, in group order.
  const { filteredItems, filteredGroups } = useMemo(() => {
    const run =
      filter === null
        ? (list: readonly unknown[]) => list
        : (list: readonly unknown[]) =>
            ((filter ?? defaultFilter) as ComboboxFilter<unknown>)(
              list,
              deferredQuery,
              itemToString,
            );
    if (!isGroupList(items)) {
      return { filteredItems: run(items), filteredGroups: null };
    }
    const groups = items
      .map((group) => ({ ...group, items: run(group.items) }))
      .filter((group) => group.items.length > 0);
    return { filteredItems: groups.flatMap((group) => group.items), filteredGroups: groups };
  }, [items, filter, deferredQuery, itemToString]);

  const indexByKey = useMemo(
    () => new Map(filteredItems.map((item, index) => [itemToKey(item), index])),
    [filteredItems, itemToKey],
  );

  const [highlight] = useState(createHighlightStore);
  const setHighlight = useCallback(
    (index: number, reason: ComboboxHighlightReason) => {
      if (highlight.get().index === index && highlight.get().reason === reason) return;
      highlight.set({ index, reason });
      onItemHighlighted?.(filteredItems[index] as T | undefined, { index, reason });
    },
    [highlight, filteredItems, onItemHighlighted],
  );

  // A new result list invalidates the index; nothing is highlighted until a key or the
  // pointer says so.
  // Only when the list changes, not when the setter's identity does.
  const latestSetHighlight = useLatest(setHighlight);
  useEffect(() => {
    if (highlight.get().index !== -1) latestSetHighlight.current(-1, 'none');
  }, [filteredItems, highlight, latestSetHighlight]);

  // The one path each piece of state takes, so the state and the report of it cannot drift.
  const setValue = useCallback(
    (next: unknown, reason: ComboboxChangeReason) => {
      setValueState(next);
      (onValueChange as ((v: unknown, d: ComboboxChangeDetails) => void) | undefined)?.(next, {
        reason,
      });
    },
    [setValueState, onValueChange],
  );

  const setInputValue = useCallback(
    (next: string, reason: ComboboxChangeReason) => {
      if (next === inputValue) return;
      setInputValueState(next);
      onInputValueChange?.(next, { reason });
    },
    [inputValue, setInputValueState, onInputValueChange],
  );

  const setOpen = useCallback(
    (next: boolean, reason: ComboboxChangeReason) => {
      if (next === open) return;
      setOpenState(next);
      onOpenChange?.(next, { reason });
      if (!next) setHighlight(-1, 'none');
    },
    [open, setOpenState, onOpenChange, setHighlight],
  );

  const close = useCallback(
    (reason: ComboboxChangeReason) => {
      setOpen(false, reason);
      // Back to what is selected: its label, or an empty query with `multiple`.
      setInputValue(selectedLabel, reason);
    },
    [setOpen, setInputValue, selectedLabel],
  );

  const select = useCallback(
    (item: unknown) => {
      const key = itemToKey(item);
      if (multiple) {
        const current = value as unknown[];
        setValue(
          selectedKeys.has(key) ? current.filter((i) => itemToKey(i) !== key) : [...current, item],
          'item-press',
        );
        setInputValue('', 'item-press');
      } else {
        // Picking the selected item again keeps it.
        if (!selectedKeys.has(key)) setValue(item, 'item-press');
        setInputValue(itemToString(item), 'item-press');
      }
      setOpen(false, 'item-press');
    },
    [multiple, value, selectedKeys, itemToKey, itemToString, setValue, setInputValue, setOpen],
  );

  const remove = useCallback(
    (item: unknown, reason: ComboboxChangeReason) => {
      if (!multiple) return;
      const key = itemToKey(item);
      setValue(
        (value as unknown[]).filter((i) => itemToKey(i) !== key),
        reason,
      );
    },
    [multiple, value, itemToKey, setValue],
  );

  const clearSelection = useCallback(
    (reason: ComboboxChangeReason) => setValue(multiple ? [] : null, reason),
    [multiple, setValue],
  );

  const clear = useCallback(() => {
    setInputValue('', 'clear');
    clearSelection('clear');
    setHighlight(-1, 'none');
  }, [setInputValue, clearSelection, setHighlight]);

  // A controlled parent can change a single selection directly — or swap the item just picked,
  // in onValueChange — and the input follows, as it does after a pick. Reported, with its own
  // reason, so whoever tracks the text through onInputValueChange stays in step.
  const selectedKey = !multiple && selectedItems[0] != null ? itemToKey(selectedItems[0]) : null;
  const lastSelectedKeyRef = useRef(selectedKey);
  // Only when the selection changes; the label and the setter are read as they are then.
  const showSelectedLabel = useLatest(() => setInputValue(selectedLabel, 'value-change'));
  useEffect(() => {
    if (lastSelectedKeyRef.current === selectedKey) return;
    lastSelectedKeyRef.current = selectedKey;
    showSelectedLabel.current();
  }, [selectedKey, showSelectedLabel]);

  const [chips, setChips] = useState<ComboboxChipEntry[]>([]);
  const registerChip = useCallback((entry: ComboboxChipEntry) => {
    setChips((current) => [...current, entry].sort(byDocumentOrder));
    return () => setChips((current) => current.filter((c) => c !== entry));
  }, []);

  const [disabledKeys] = useState(() => new Set<string>());

  const [insideRefs] = useState(() => new Set<RefObject<HTMLElement | null>>());
  const registerInside = useCallback(
    (ref: RefObject<HTMLElement | null>) => {
      insideRefs.add(ref);
      return () => {
        insideRefs.delete(ref);
      };
    },
    [insideRefs],
  );

  const [hasGroup, setHasGroup] = useState(false);
  const registerGroup = useCallback(() => {
    setHasGroup(true);
    return () => setHasGroup(false);
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLElement | null>(null);

  // `form.reset()` returns the selection and the text to what they mounted with. Hidden
  // inputs are not reset by the platform, so only React's state needs restoring.
  const [initial] = useState({ value, inputValue });
  useEffect(() => {
    // `.form` also honours a `form="id"` attribute.
    const owner = inputRef.current?.form;
    if (!owner) return;

    function onReset(event: Event) {
      // A later listener can still cancel the reset, so wait until dispatch has finished.
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        if (value !== initial.value) setValue(initial.value, 'form-reset');
        setInputValue(initial.inputValue, 'form-reset');
      });
    }

    owner.addEventListener('reset', onReset);
    return () => owner.removeEventListener('reset', onReset);
  }, [value, initial, setValue, setInputValue]);

  const isInside = useCallback(
    (node: Node) =>
      [inputRef, popupRef, ...insideRefs, ...chips.map((chip) => chip.ref)].some(
        (ref) => ref.current?.contains(node) ?? false,
      ),
    [insideRefs, chips],
  );

  const id = useId();

  const context: ComboboxRootContextValue = useMemo(
    () => ({
      open,
      multiple,
      disabled,
      required,
      inputValue,
      loading,
      filteredItems,
      filteredGroups,
      itemToString,
      itemToKey,
      indexByKey,
      selectedKeys,
      selectedItems,
      disabledKeys,
      highlight,
      setHighlight,
      setOpen,
      setInputValue,
      select,
      remove,
      clearSelection,
      clear,
      close,
      registerChip,
      chips,
      registerInside,
      isInside,
      hasGroup,
      registerGroup,
      onLoadMore,
      inputId: `${id}-input`,
      listId: `${id}-list`,
      optionId: (index: number) => `${id}-option-${index}`,
      anchorName: anchorNameFor(id),
      inputRef,
      popupRef,
    }),
    [
      open,
      multiple,
      disabled,
      required,
      inputValue,
      loading,
      filteredItems,
      filteredGroups,
      itemToString,
      itemToKey,
      indexByKey,
      selectedKeys,
      selectedItems,
      disabledKeys,
      highlight,
      setHighlight,
      setOpen,
      setInputValue,
      select,
      remove,
      clearSelection,
      clear,
      close,
      registerChip,
      chips,
      registerInside,
      isInside,
      hasGroup,
      registerGroup,
      onLoadMore,
      id,
    ],
  );

  return (
    <ComboboxRootContext.Provider value={context}>
      {children}
      {name !== undefined &&
        (multiple ? selectedItems : [selectedItems[0] ?? null]).map((item, index) => (
          <input
            key={item === null ? index : itemToKey(item)}
            type="hidden"
            name={name}
            form={form}
            disabled={disabled}
            value={item === null ? '' : itemToKey(item)}
          />
        ))}
    </ComboboxRootContext.Provider>
  );
}
