import { useCallback, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import type { Orientation } from '../core/rovingFocus';
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

function documentOrder(a: TabEntry, b: TabEntry): number {
  const x = a.ref.current;
  const y = b.ref.current;
  if (!x || !y) return 0;
  return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
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
      [...current.filter((t) => t.value !== entry.value), entry].sort(documentOrder),
    );
    return () => setTabs((current) => current.filter((t) => t !== entry));
  }, []);

  const enabledTabs = useMemo(() => tabs.filter((t) => !t.disabled), [tabs]);

  // The selected tab holds the Tab stop; if it is disabled or missing, the first enabled one
  // does, so the group is always reachable. Before any tab registers — the first render —
  // the selection is the best guess.
  const tabStopValue =
    tabs.length === 0
      ? value
      : (enabledTabs.find((t) => t.value === value) ?? enabledTabs[0])?.value;

  const baseId = useId();
  const context: TabsRootContextValue = useMemo(
    () => ({
      value,
      setValue,
      orientation,
      activationMode,
      enabledTabs,
      tabStopValue,
      register,
      tabId: (v: string) => `${baseId}-tab-${idPart(v)}`,
      panelId: (v: string) => `${baseId}-panel-${idPart(v)}`,
    }),
    [value, setValue, orientation, activationMode, enabledTabs, tabStopValue, register, baseId],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { ...orientationDataAttributes(orientation), className, children },
    consumerProps: rest as UnknownProps,
  });

  return <TabsRootContext.Provider value={context}>{element}</TabsRootContext.Provider>;
}
