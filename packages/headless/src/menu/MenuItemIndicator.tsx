'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { menuCheckableDataAttributes, useMenuItemIndicatorContext } from './useMenuItem';

type MenuItemIndicatorOwnProps = {
  /** Element to render instead of the default `<span>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuItemIndicatorProps = MenuItemIndicatorOwnProps &
  Omit<ComponentPropsWithRef<'span'>, keyof MenuItemIndicatorOwnProps>;

/**
 * Where the check goes, in a CheckboxItem or a RadioItem — one part for both, since it reads
 * the same `checked` from either. Ships no glyph, as Checkbox.Indicator ships none: supply it as
 * children, or draw it off the `data-*` attributes, which match the item's.
 *
 * Always rendered, in every state, so an unchecked item keeps its space and its label lines up
 * with the checked ones. Hidden from assistive technology: the item announces `aria-checked`.
 */
export function MenuItemIndicator({
  className,
  children,
  render,
  ...rest
}: MenuItemIndicatorProps) {
  const state = useMenuItemIndicatorContext();

  return useRender({
    render,
    defaultTagName: 'span',
    props: { 'aria-hidden': true, ...menuCheckableDataAttributes(state), className, children },
    consumerProps: rest as UnknownProps,
  });
}
