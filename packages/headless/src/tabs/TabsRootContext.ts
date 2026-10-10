'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type { Orientation } from '../core/rovingFocus';

export type TabsActivationMode = 'automatic' | 'manual';

/** The state Tabs.Root shares with its parts, and projects as `data-*` attributes. */
export type TabsState = {
  value: string | undefined;
  orientation: Orientation;
};

/** A Tab as the Root knows it: its props, and its element only to move focus to. */
export type TabEntry = {
  value: string;
  disabled: boolean;
  ref: RefObject<HTMLElement | null>;
};

export type TabsRootContextValue = TabsState & {
  setValue: (value: string) => void;
  activationMode: TabsActivationMode;
  /** The tabs the arrow keys reach, in document order. */
  navigableTabs: TabEntry[];
  /** Already `false` under automatic activation. */
  focusableWhenDisabled: boolean;
  /** The tab that takes the group's single Tab stop. */
  tabStopValue: string | undefined;
  register: (entry: TabEntry) => () => void;
  tabId: (value: string) => string;
  panelId: (value: string) => string;
};

export const TabsRootContext = createContext<TabsRootContextValue | null>(null);

export function useTabsRootContext(part: string): TabsRootContextValue {
  const context = useContext(TabsRootContext);

  if (context === null) {
    throw new Error(`<Tabs.${part}> must be rendered inside <Tabs.Root>.`);
  }

  return context;
}
