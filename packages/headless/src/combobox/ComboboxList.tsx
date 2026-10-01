import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';

type ComboboxListOwnProps<T> = {
  /**
   * A function rendering one `Combobox.Item` per filtered item, or any nodes. With a
   * virtualizer, render only the rows it asks for.
   */
  children?: ReactNode | ((item: T, index: number) => ReactNode);
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxListProps<T = unknown> = ComboboxListOwnProps<T> &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxListOwnProps<T>>;

/**
 * The `role="listbox"`. Given a function, renders it once per item the filter left.
 *
 * With the Root's `onLoadMore`, an invisible sentinel follows the items; when it scrolls into
 * view and nothing is `loading`, `onLoadMore` is called. The list is `aria-busy` meanwhile.
 */
export function ComboboxList<T = unknown>({
  className,
  children,
  render,
  ...rest
}: ComboboxListProps<T>) {
  const { multiple, loading, filteredItems, onLoadMore, listId } = useComboboxRootContext('List');

  const content =
    typeof children === 'function'
      ? (filteredItems as readonly T[]).map((item, index) => children(item, index))
      : children;

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: listId,
      role: 'listbox',
      'aria-multiselectable': multiple || undefined,
      'aria-busy': loading || undefined,
      className,
      children: (
        <>
          {content}
          {onLoadMore && <LoadMoreSentinel />}
        </>
      ),
    },
    consumerProps: rest as UnknownProps,
  });
}

/** Asks for more items once the end of the list is in view. */
function LoadMoreSentinel() {
  const { open, loading, filteredItems, onLoadMore } = useComboboxRootContext('List');
  const ref = useRef<HTMLDivElement | null>(null);
  // The latest callback, so an inline function does not re-observe on every render.
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Re-observed when the list grows or loading ends, so a sentinel still in view after a
  // page arrives asks for the next one.
  useEffect(() => {
    const element = ref.current;
    if (!element || !open || loading || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current?.();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, loading, filteredItems.length]);

  return <div ref={ref} aria-hidden="true" data-load-more="" style={{ blockSize: 1 }} />;
}
