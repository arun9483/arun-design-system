'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { byDocumentOrder, type Orientation } from '../core/rovingFocus';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  TabsRootContext,
  type TabEntry,
  type TabsActivationMode,
  type TabsRootContextValue,
} from './TabsRootContext';
import { orientationDataAttributes } from './tabsDataAttributes';

type TabsRootOwnProps = {
  /**
   * Controlled selection: the `value` of the selected Tab. Provide `onValueChange` alongside.
   *
   * Never `undefined` once mounted: the mode is latched at mount, as for Switch.
   */
  value?: string;
  /** Initial selection when uncontrolled. Read once, at mount. Without one, none is selected. */
  defaultValue?: string;
  /** Called with the Tab's `value` whenever the selection changes. */
  onValueChange?: (value: string) => void;
  /** The axis the tabs run along, and so which arrow keys move between them. */
  orientation?: Orientation;
  /**
   * `automatic` selects a tab as soon as it has focus; `manual` waits for Enter, Space or a
   * click. Manual suits panels that are slow to show.
   */
  activationMode?: TabsActivationMode;
  /**
   * Keeps disabled tabs in the arrow-key sequence, so a screen reader announces them as
   * unavailable. They still cannot be selected. Only with `activationMode="manual"`: under
   * `"automatic"` moving focus to a tab selects it, so disabled tabs are always skipped and
   * this has no effect.
   */
  focusableWhenDisabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TabsRootProps = TabsRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof TabsRootOwnProps | 'defaultValue' | 'onChange'>;

/** An ID-safe form of a tab's value: ids and ID-reference lists split on whitespace. */
function idPart(value: string): string {
  return value.replace(/\s+/g, '_');
}

/**
 * Tabs, by the WAI-ARIA pattern: a tablist of tabs, one panel each, one selected.
 *
 * There is no native element to lean on (decision 7), so the behaviour is built here: the
 * selection, arrow-key focus with a single Tab stop (roving tabindex, `core/rovingFocus`),
 * and the ids that wire each tab to its panel.
 *
 * Each Tab registers its own `value` and `disabled` from its props; the Root never reads
 * them back from the DOM (decision 10). Elements are kept only to move focus to.
 */
export function TabsRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  focusableWhenDisabled: focusableWhenDisabledProp = false,
  className,
  children,
  render,
  ...rest
}: TabsRootProps) {
  const [value, setValueState] = useControlled<string | undefined>({
    controlled: valueProp,
    default: defaultValue,
    name: 'Tabs.Root',
    state: 'value',
  });

  // The one path every change takes, so the state and the report of it cannot drift.
  const setValue = useCallback(
    (next: string) => {
      if (next === value) return;
      setValueState(next);
      onValueChange?.(next);
    },
    [value, setValueState, onValueChange],
  );

  const [tabs, setTabs] = useState<TabEntry[]>([]);
  const register = useCallback((entry: TabEntry) => {
    setTabs((current) =>
      [...current.filter((t) => t.value !== entry.value), entry].sort(byDocumentOrder),
    );
    return () => setTabs((current) => current.filter((t) => t !== entry));
  }, []);

  // Ignored under automatic activation, where focus selects: a disabled tab must never be.
  const focusableWhenDisabled = focusableWhenDisabledProp && activationMode === 'manual';
  const navigableTabs = useMemo(
    () => (focusableWhenDisabled ? tabs : tabs.filter((t) => !t.disabled)),
    [tabs, focusableWhenDisabled],
  );

  // The selected tab holds the Tab stop; if it is unreachable or missing, the first reachable
  // one does, so the group is always reachable. Before any tab registers — the first render —
  // the selection is the best guess.
  const tabStopValue =
    tabs.length === 0
      ? value
      : (navigableTabs.find((t) => t.value === value) ?? navigableTabs[0])?.value;

  const baseId = useId();
  const context: TabsRootContextValue = useMemo(
    () => ({
      value,
      setValue,
      orientation,
      activationMode,
      navigableTabs,
      focusableWhenDisabled,
      tabStopValue,
      register,
      tabId: (v: string) => `${baseId}-tab-${idPart(v)}`,
      panelId: (v: string) => `${baseId}-panel-${idPart(v)}`,
    }),
    [
      value,
      setValue,
      orientation,
      activationMode,
      navigableTabs,
      focusableWhenDisabled,
      tabStopValue,
      register,
      baseId,
    ],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { ...orientationDataAttributes(orientation), className, children },
    consumerProps: rest as UnknownProps,
  });

  return <TabsRootContext.Provider value={context}>{element}</TabsRootContext.Provider>;
}
