import { useLayoutEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuGroupContext } from './MenuGroup';

type MenuGroupLabelOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuGroupLabelProps = MenuGroupLabelOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof MenuGroupLabelOwnProps>;

/**
 * Names its Group or RadioGroup. Shown in the menu, but not an item: it cannot be activated,
 * and the arrow keys and typeahead pass it.
 */
export function MenuGroupLabel({ className, children, render, ...rest }: MenuGroupLabelProps) {
  const group = useMenuGroupContext();
  if (group === null) {
    throw new Error('<Menu.GroupLabel> must be rendered inside <Menu.Group> or <Menu.RadioGroup>.');
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
