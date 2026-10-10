'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useTabsRootContext } from './TabsRootContext';
import { selectedDataAttributes } from './tabsDataAttributes';

type TabsPanelOwnProps = {
  /** The `value` of the Tab this panel belongs to. */
  value: string;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TabsPanelProps = TabsPanelOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof TabsPanelOwnProps>;

/**
 * The content for one tab, labelled by it. Hidden with the `hidden` attribute while its tab
 * is not selected, and stays mounted, so what is inside keeps its state between visits.
 *
 * `tabIndex={0}`, as the pattern recommends, so a panel with nothing focusable inside is
 * still reached by Tab after the tablist.
 */
export function TabsPanel({ value, className, children, render, ...rest }: TabsPanelProps) {
  const { value: selectedValue, tabId, panelId } = useTabsRootContext('Panel');
  const selected = value === selectedValue;

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'tabpanel',
      id: panelId(value),
      'aria-labelledby': tabId(value),
      tabIndex: 0,
      hidden: !selected || undefined,
      ...selectedDataAttributes(selected),
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });
}
