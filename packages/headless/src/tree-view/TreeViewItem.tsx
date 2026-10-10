'use client';

import { Children, useContext, useId, useLayoutEffect, useMemo, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { textOf } from '../core/typeahead';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  TreeViewItemContext,
  useTreeViewRootContext,
  type TreeViewItemContextValue,
} from './TreeViewRootContext';
import { treeViewItemDataAttributes } from './treeViewDataAttributes';

type TreeViewItemOwnProps = {
  /** Identifies the Item in the Root's `value` and `expanded`. Unique in the tree. */
  value: string;
  /** What the row shows, and the Item's accessible name. Icons go in it too. */
  label: ReactNode;
  /**
   * What typeahead matches, when the text in `label` is not it — or when `label` is a component
   * that renders its own text, which cannot be read from props.
   */
  textValue?: string;
  /** Cannot be focused, selected, opened or closed. Skipped by the arrow keys. */
  disabled?: boolean;
  /** Child Items. With any, this Item is a parent: it opens and closes, and shows them when open. */
  children?: ReactNode;
  /** Element to render instead of the default `<li>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TreeViewItemProps = TreeViewItemOwnProps &
  Omit<ComponentPropsWithRef<'li'>, keyof TreeViewItemOwnProps>;

/**
 * One node: an `<li role="treeitem">`, focused as a whole, holding its row — a `<div>` with the
 * `label`, which names it — and, while open, its child Items in a `<ul role="group">`. The row
 * and the group are placed by the Item, so they are not parts (decision 11); style them as the
 * Item's first child and its `[role='group']`.
 *
 * A click on the Item, outside its children, selects it and opens or closes a parent, as Enter
 * does.
 */
export function TreeViewItem({
  value,
  label,
  textValue,
  disabled = false,
  className,
  children,
  render,
  ...rest
}: TreeViewItemProps) {
  const root = useTreeViewRootContext();
  const parent = useContext(TreeViewItemContext);
  const ref = useRef<HTMLElement | null>(null);
  const groupRef = useRef<HTMLUListElement | null>(null);
  const labelId = useId();

  // A parent is decided from props, so it is known on the first render, the server's included.
  const parentItem = Children.toArray(children).length > 0;
  const level = parent ? parent.level + 1 : 1;
  const parentValue = parent?.value ?? null;
  const text = textValue ?? textOf(label);
  const selected = root.value.includes(value);
  const expanded = parentItem && root.expanded.includes(value);

  const { register } = root;
  useLayoutEffect(
    () => register({ value, parent: parentValue, disabled, parentItem, textValue: text, ref }),
    [register, value, parentValue, disabled, parentItem, text],
  );

  const own: TreeViewItemContextValue = useMemo(() => ({ value, level }), [value, level]);

  return useRender({
    render,
    defaultTagName: 'li',
    props: {
      role: 'treeitem',
      'aria-labelledby': labelId,
      'aria-level': level,
      'aria-selected': selected,
      'aria-expanded': parentItem ? expanded : undefined,
      'aria-disabled': disabled || undefined,
      // A disabled Item takes no focus, so a click on it cannot focus the Item around it.
      tabIndex: disabled ? undefined : value === root.tabStopValue ? 0 : -1,
      ...treeViewItemDataAttributes({ selected, expanded, parentItem, disabled }),
      className,
      ref,
      // On the Item, which has the treeitem role; a press inside a child Item is that child's.
      onMouseDown(event: ReactMouseEvent) {
        // A disabled Item is not focusable; without this, the press would focus the nearest
        // focusable element around it — its parent Item.
        if (disabled && !groupRef.current?.contains(event.target as Node)) event.preventDefault();
      },
      onClick(event: ReactMouseEvent) {
        // Guarded on state, not an attribute (decision 10).
        if (disabled || groupRef.current?.contains(event.target as Node)) return;
        root.select(value);
        if (parentItem) root.setOpen(value, !expanded);
      },
      children: (
        <>
          <div id={labelId}>{label}</div>
          {expanded && (
            <TreeViewItemContext.Provider value={own}>
              <ul role="group" ref={groupRef}>
                {children}
              </ul>
            </TreeViewItemContext.Provider>
          )}
        </>
      ),
    },
    consumerProps: rest as UnknownProps,
  });
}
