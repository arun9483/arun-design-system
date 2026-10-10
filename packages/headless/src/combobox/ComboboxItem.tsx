'use client';

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';
import { useComboboxGroupContext } from './ComboboxGroup';
import { comboboxItemDataAttributes } from './comboboxDataAttributes';

type ComboboxItemOwnProps<T> = {
  /** The item this option stands for — one of the Root's `items`. */
  value: T;
  /** Cannot be picked, and the arrow keys skip it. A disabled Group disables it too. */
  disabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxItemProps<T = unknown> = ComboboxItemOwnProps<T> &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxItemOwnProps<T>>;

/**
 * One option. A press picks it — with `multiple`, toggles it — and the pointer highlights it.
 * Never focused: the input keeps focus and points at the highlighted option.
 *
 * `data-selected` and `aria-selected` follow the Root's `value`; `data-highlighted` follows
 * the arrow keys and the pointer. Only the items whose highlight changes re-render.
 */
export function ComboboxItem<T = unknown>({
  value,
  disabled: disabledProp = false,
  className,
  children,
  render,
  ...rest
}: ComboboxItemProps<T>) {
  const {
    itemToKey,
    indexByKey,
    selectedKeys,
    disabledKeys,
    highlight,
    setHighlight,
    select,
    optionId,
  } = useComboboxRootContext('Item');
  const group = useComboboxGroupContext();
  const disabled = disabledProp || (group?.disabled ?? false);
  const key = itemToKey(value);
  const index = indexByKey.get(key) ?? -1;
  const selected = selectedKeys.has(key);
  const highlighted = useSyncExternalStore(
    highlight.subscribe,
    () => index >= 0 && highlight.get().index === index,
    () => false,
  );
  const elementRef = useRef<HTMLElement | null>(null);

  // Registered from props, so the arrow keys skip it without reading the DOM (decision 10).
  useLayoutEffect(() => {
    if (!disabled) return;
    disabledKeys.add(key);
    return () => {
      disabledKeys.delete(key);
    };
  }, [disabled, disabledKeys, key]);

  // The arrow keys move the highlight past the edge of a scrolled list: bring it into view.
  useEffect(() => {
    if (highlighted && highlight.get().reason === 'keyboard') {
      elementRef.current?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [highlighted, highlight]);

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: index >= 0 ? optionId(index) : undefined,
      role: 'option',
      'aria-selected': selected,
      'aria-disabled': disabled || undefined,
      ...comboboxItemDataAttributes({ selected, highlighted, disabled }),
      className,
      children,
      ref: elementRef,
      onMouseDown(event: ReactMouseEvent) {
        event.preventDefault();
      },
      onPointerMove() {
        if (!disabled && !highlighted && index >= 0) setHighlight(index, 'pointer');
      },
      onClick() {
        // Guarded on state, not an attribute a `render` element might drop (decision 10).
        if (!disabled) select(value);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
