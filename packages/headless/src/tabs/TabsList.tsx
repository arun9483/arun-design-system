import { useRef } from 'react';
import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { rovingIndex } from '../core/rovingFocus';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useTabsRootContext } from './TabsRootContext';
import { orientationDataAttributes } from './tabsDataAttributes';

type TabsListOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type TabsListProps = TabsListOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof TabsListOwnProps>;

/**
 * The tablist. Holds the keyboard: arrows along the orientation, wrapping at the ends,
 * Home and End — moving focus among the enabled tabs only. Whether focusing a tab also
 * selects it is the Tab's to decide, by `activationMode`.
 *
 * Name it with `aria-label` or `aria-labelledby` when the page has more than one.
 */
export function TabsList({ className, children, render, ...rest }: TabsListProps) {
  const { orientation, enabledTabs } = useTabsRootContext('List');
  const elementRef = useRef<HTMLElement | null>(null);

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'tablist',
      // Horizontal is the ARIA default for a tablist, so it is only stated when vertical.
      'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
      ...orientationDataAttributes(orientation),
      className,
      children,
      ref: elementRef,
      onKeyDown(event: ReactKeyboardEvent) {
        const current = enabledTabs.findIndex((t) => t.ref.current === event.target);
        // Only from a tab of this list: a nested widget's keys are its own.
        if (current < 0) return;
        const list = elementRef.current;
        const rtl = list ? getComputedStyle(list).direction === 'rtl' : false;
        const next = rovingIndex(event.key, {
          count: enabledTabs.length,
          current,
          orientation,
          rtl,
        });
        if (next === null) return;
        event.preventDefault();
        enabledTabs[next]?.ref.current?.focus();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
