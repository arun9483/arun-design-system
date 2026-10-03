import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuRootContext } from './MenuRootContext';

type MenuGroupOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuGroupProps = MenuGroupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof MenuGroupOwnProps>;

type MenuGroupContextValue = {
  labelId: string;
  registerLabel: () => () => void;
};

const MenuGroupContext = createContext<MenuGroupContextValue | null>(null);

export function useMenuGroupContext(): MenuGroupContextValue | null {
  return useContext(MenuGroupContext);
}

/**
 * The `role="group"` both Group and RadioGroup render: named by a GroupLabel inside, once one is
 * there, through `aria-labelledby`. Returns the element wrapped in the context the label reads.
 */
export function useMenuGroupElement(
  part: string,
  {
    render,
    props,
    consumerProps,
  }: { render?: ReactElement; props: UnknownProps; consumerProps: UnknownProps },
) {
  useMenuRootContext(part);
  const labelId = `${useId()}-label`;
  const [hasLabel, setHasLabel] = useState(false);
  const registerLabel = useCallback(() => {
    setHasLabel(true);
    return () => setHasLabel(false);
  }, []);
  const context = useMemo(() => ({ labelId, registerLabel }), [labelId, registerLabel]);

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { role: 'group', 'aria-labelledby': hasLabel ? labelId : undefined, ...props },
    consumerProps,
  });

  return <MenuGroupContext.Provider value={context}>{element}</MenuGroupContext.Provider>;
}

/**
 * Items under a label: `role="group"`, named by its GroupLabel — the menu → group → item
 * structure APG allows. The arrow keys and typeahead run through every group's items as one
 * list, past the labels.
 */
export function MenuGroup({ className, children, render, ...rest }: MenuGroupProps) {
  return useMenuGroupElement('Group', {
    render,
    props: { className, children },
    consumerProps: rest as UnknownProps,
  });
}
