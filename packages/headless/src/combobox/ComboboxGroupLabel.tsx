'use client';

import { useLayoutEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxGroupContext } from './ComboboxGroup';

type ComboboxGroupLabelOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxGroupLabelProps = ComboboxGroupLabelOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxGroupLabelOwnProps>;

/**
 * Names its Group, as an `<optgroup>`'s `label` does. Shown in the list, but not an option:
 * it cannot be picked, and the arrow keys pass it.
 */
export function ComboboxGroupLabel({
  className,
  children,
  render,
  ...rest
}: ComboboxGroupLabelProps) {
  const group = useComboboxGroupContext();
  if (group === null) {
    throw new Error('<Combobox.GroupLabel> must be rendered inside <Combobox.Group>.');
  }
  const { labelId, registerLabel } = group;
  useLayoutEffect(registerLabel, [registerLabel]);

  return useRender({
    render,
    defaultTagName: 'div',
    props: { id: labelId, className, children },
    consumerProps: rest as UnknownProps,
  });
}
