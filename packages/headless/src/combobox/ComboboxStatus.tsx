import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';

type ComboboxStatusOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxStatusProps = ComboboxStatusOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxStatusOwnProps>;

/**
 * A polite live region for what a screen reader should hear about the list: "Searching…",
 * "12 results", an error. Its text is yours; a change to it is announced.
 */
export function ComboboxStatus({ className, children, render, ...rest }: ComboboxStatusProps) {
  useComboboxRootContext('Status');
  return useRender({
    render,
    defaultTagName: 'div',
    props: { role: 'status', 'aria-live': 'polite', 'aria-atomic': true, className, children },
    consumerProps: rest as UnknownProps,
  });
}
