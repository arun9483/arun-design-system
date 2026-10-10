'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';

type ComboboxEmptyOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxEmptyProps = ComboboxEmptyOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxEmptyOwnProps>;

/**
 * Shown when the filter leaves nothing and nothing is `loading` — "No results". Renders
 * nothing otherwise. Place it in the Popup, outside the List.
 */
export function ComboboxEmpty({ className, children, render, ...rest }: ComboboxEmptyProps) {
  const { filteredItems, loading } = useComboboxRootContext('Empty');
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { className, children },
    consumerProps: rest as UnknownProps,
  });
  return filteredItems.length === 0 && !loading ? element : null;
}
