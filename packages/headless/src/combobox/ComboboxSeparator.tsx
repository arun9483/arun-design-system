import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';

type ComboboxSeparatorOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxSeparatorProps = ComboboxSeparatorOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxSeparatorOwnProps>;

/**
 * A line between items or groups in the List, as an `<hr>` in a `<select>`. The arrow keys pass
 * it.
 *
 * Visual only: `aria-hidden`, with no `role="separator"`. A listbox may own only options and
 * groups, so a separator role inside one fails `aria-required-children`; a Group, named by its
 * label, is what tells a screen reader where one set ends.
 */
export function ComboboxSeparator({ className, render, ...rest }: ComboboxSeparatorProps) {
  useComboboxRootContext('Separator');
  return useRender({
    render,
    defaultTagName: 'div',
    props: { 'aria-hidden': true, className },
    consumerProps: rest as UnknownProps,
  });
}
