import { useCallback, useMemo, useState } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { byDocumentOrder } from '../core/rovingFocus';
import { typeaheadIndex, useTypeahead } from '../core/typeahead';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  TreeViewRootContext,
  type TreeViewItemEntry,
  type TreeViewRootContextValue,
} from './TreeViewRootContext';

type TreeViewRootOwnProps = {
  /** Controlled: the selected Items' values. Provide `onValueChange` alongside it. */
  value?: readonly string[];
  /** Initial selection when uncontrolled. Read once, at mount. */
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  /**
   * Lets more than one Item be selected: Space, Enter or a click toggles one, Shift with an
   * arrow key toggles the next, and Ctrl or ⌘ with A selects every one shown. Without it,
   * selecting an Item replaces the selection.
   */
  multiple?: boolean;
  /** Controlled: the open parent Items' values. Provide `onExpandedChange` alongside it. */
  expanded?: readonly string[];
  /** Initially open parent Items when uncontrolled. Read once, at mount. */
  defaultExpanded?: readonly string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Element to render instead of the default `<ul>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

/** The fallback default: one array, so a re-render does not read as a changed default. */
const NONE: readonly string[] = [];

export type TreeViewRootProps = TreeViewRootOwnProps &
  Omit<ComponentPropsWithRef<'ul'>, keyof TreeViewRootOwnProps | 'defaultValue' | 'onChange'>;

/**
 * A tree, by the WAI-ARIA pattern (decision 26): `role="tree"`, Items nested in Items, one Tab
 * stop, and the arrow keys to move, open and close. Name it with `aria-label`.
 *
 * Items register their value, parent and `disabled` from their props; the Root never reads them
 * back from the DOM (decision 10). An Item's children render only while it is open, so the
 * registered Items are exactly the ones shown, in document order.
 */
export function TreeViewRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  className,
  children,
  render,
  ...rest
}: TreeViewRootProps) {
  const [value, setValueState] = useControlled<readonly string[]>({
    controlled: valueProp,
    default: defaultValue ?? NONE,
    name: 'TreeView.Root',
    state: 'value',
  });
  const [expanded, setExpandedState] = useControlled<readonly string[]>({
    controlled: expandedProp,
    default: defaultExpanded ?? NONE,
    name: 'TreeView.Root',
    state: 'expanded',
  });

  // The one path each change takes, so the state and the report of it cannot drift.
  const setValue = useCallback(
    (next: string[]) => {
      setValueState(next);
      onValueChange?.(next);
    },
    [setValueState, onValueChange],
  );
  const select = useCallback(
    (item: string) => {
      if (multiple) {
        setValue(value.includes(item) ? value.filter((v) => v !== item) : [...value, item]);
      } else if (value.length !== 1 || value[0] !== item) {
        // Selecting the selected Item again keeps it, as a click on a selected file does.
        setValue([item]);
      }
    },
    [multiple, value, setValue],
  );
  const setExpanded = useCallback(
    (next: string[]) => {
      setExpandedState(next);
      onExpandedChange?.(next);
    },
    [setExpandedState, onExpandedChange],
  );
  const setOpen = useCallback(
    (item: string, open: boolean) => {
      if (expanded.includes(item) === open) return;
      setExpanded(open ? [...expanded, item] : expanded.filter((v) => v !== item));
    },
    [expanded, setExpanded],
  );

  const [items, setItems] = useState<TreeViewItemEntry[]>([]);
  const register = useCallback((entry: TreeViewItemEntry) => {
    setItems((current) =>
      [...current.filter((i) => i.value !== entry.value), entry].sort(byDocumentOrder),
    );
    return () => setItems((current) => current.filter((i) => i !== entry));
  }, []);

  // Disabled Items are skipped, as in every roving group (decision 13).
  const navigable = useMemo(() => items.filter((i) => !i.disabled), [items]);

  // The Item last focused holds the Tab stop; until one has been, or if it is gone, the first
  // selected Item shown, or else the first. Before any Item registers — the first render — the
  // selection is the best guess.
  const [focused, setFocused] = useState<string | undefined>(undefined);
  const tabStopValue =
    items.length === 0
      ? value[0]
      : (
          navigable.find((i) => i.value === focused) ??
          navigable.find((i) => value.includes(i.value)) ??
          navigable[0]
        )?.value;

  const typeahead = useTypeahead();

  const focus = (item: TreeViewItemEntry | undefined) => {
    item?.ref.current?.focus();
    return item;
  };

  /** What a click does too: select it, and open or close a parent. */
  const activate = (item: TreeViewItemEntry) => {
    select(item.value);
    if (item.parentItem) setOpen(item.value, !expanded.includes(item.value));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) return;
    const index = navigable.findIndex((i) => i.ref.current === event.target);
    const item = navigable[index];
    // Only from an Item: a widget inside a label keeps its own keys.
    if (!item) return;
    const open = item.parentItem && expanded.includes(item.value);
    // In a right-to-left tree, the children open toward the left.
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const [inward, outward] = rtl ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];
    const { key } = event;
    const modifier = event.ctrlKey || event.metaKey;

    if (key === '*' && !modifier) {
      // Opens every parent beside this one, as APG's tree does.
      event.preventDefault();
      const siblings = navigable
        .filter((i) => i.parent === item.parent && i.parentItem)
        .map((i) => i.value);
      const next = [...expanded, ...siblings.filter((v) => !expanded.includes(v))];
      if (next.length !== expanded.length) setExpanded(next);
      return;
    }
    if (multiple && modifier && !event.altKey && key.toLowerCase() === 'a') {
      event.preventDefault();
      setValue(navigable.map((i) => i.value));
      return;
    }

    const search = typeahead(event);
    if (search !== null) {
      // A typed key is the search's, matched or not: a Space in one must not select.
      event.preventDefault();
      const next = typeaheadIndex(
        navigable.map((i) => i.textValue),
        index,
        search,
      );
      if (next !== null) focus(navigable[next]);
      return;
    }

    switch (key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        // The ends are the ends: a tree does not wrap.
        const target = focus(navigable[key === 'ArrowDown' ? index + 1 : index - 1]);
        if (target && multiple && event.shiftKey) select(target.value);
        return;
      }
      case 'Home':
        event.preventDefault();
        focus(navigable[0]);
        return;
      case 'End':
        event.preventDefault();
        focus(navigable.at(-1));
        return;
      case inward:
        event.preventDefault();
        // Opens a closed parent; on an open one, moves to its first child.
        if (!item.parentItem) return;
        if (!open) setOpen(item.value, true);
        else if (navigable[index + 1]?.parent === item.value) focus(navigable[index + 1]);
        return;
      case outward:
        event.preventDefault();
        // Closes an open parent; anywhere else, moves to the Item it is nested in.
        if (open) setOpen(item.value, false);
        else focus(navigable.find((i) => i.value === item.parent));
        return;
      case 'Enter':
        event.preventDefault();
        activate(item);
        return;
      case ' ':
        event.preventDefault();
        select(item.value);
        return;
    }
  };

  // The Tab stop follows focus however it arrives — a key, a click or a script.
  const onFocus = (event: ReactFocusEvent<HTMLElement>) => {
    const item = navigable.find((i) => i.ref.current === event.target);
    if (item) setFocused(item.value);
  };

  const context: TreeViewRootContextValue = useMemo(
    () => ({ value, expanded, multiple, register, select, setOpen, tabStopValue }),
    [value, expanded, multiple, register, select, setOpen, tabStopValue],
  );

  const element = useRender({
    render,
    defaultTagName: 'ul',
    props: {
      role: 'tree',
      'aria-multiselectable': multiple || undefined,
      className,
      children,
      onKeyDown,
      onFocus,
    },
    consumerProps: rest as UnknownProps,
  });

  return <TreeViewRootContext.Provider value={context}>{element}</TreeViewRootContext.Provider>;
}
