'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/** The state TreeView.Root shares with its Items, and projects as `data-*` attributes. */
export type TreeViewState = {
  /** The selected Items' values. */
  value: readonly string[];
  /** The open parent Items' values. */
  expanded: readonly string[];
  multiple: boolean;
};

/**
 * An Item as the Root knows it: its props, and its element only to move focus to. Only rendered
 * Items register, and an Item's children render only while it is open, so every entry is
 * visible.
 */
export type TreeViewItemEntry = {
  value: string;
  /** The value of the Item it is nested in; `null` at the top level. */
  parent: string | null;
  disabled: boolean;
  /** Has child Items, so it opens and closes. */
  parentItem: boolean;
  /** What typeahead matches: `textValue`, or the text in its `label`. */
  textValue: string;
  ref: RefObject<HTMLElement | null>;
};

export type TreeViewRootContextValue = TreeViewState & {
  register: (entry: TreeViewItemEntry) => () => void;
  /** Selects an Item: the only one, or, with `multiple`, toggled among the others. */
  select: (value: string) => void;
  setOpen: (value: string, open: boolean) => void;
  /** The Item holding the tree's single Tab stop. */
  tabStopValue: string | undefined;
};

export const TreeViewRootContext = createContext<TreeViewRootContextValue | null>(null);

export function useTreeViewRootContext(): TreeViewRootContextValue {
  const context = useContext(TreeViewRootContext);
  if (context === null) {
    throw new Error('<TreeView.Item> must be rendered inside <TreeView.Root>.');
  }
  return context;
}

/** The Item a nested Item sits in: its value, and how deep it is. */
export type TreeViewItemContextValue = { value: string; level: number };

export const TreeViewItemContext = createContext<TreeViewItemContextValue | null>(null);
