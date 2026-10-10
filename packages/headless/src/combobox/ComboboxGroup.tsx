'use client';

import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';

type ComboboxGroupOwnProps = {
  /** Disables every Item inside, as `disabled` on an `<optgroup>` does. */
  disabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxGroupProps = ComboboxGroupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxGroupOwnProps>;

type ComboboxGroupContextValue = {
  disabled: boolean;
  labelId: string;
  registerLabel: () => () => void;
};

const ComboboxGroupContext = createContext<ComboboxGroupContextValue | null>(null);

/** The Group an Item or GroupLabel sits in, if any. */
export function useComboboxGroupContext(): ComboboxGroupContextValue | null {
  return useContext(ComboboxGroupContext);
}

/**
 * Items under a label, as an `<optgroup>`: `role="group"`, named by its GroupLabel. Render one
 * from the List's function for each group of the Root's `items`, with an Item for each of the
 * group's `items` — the filter has already narrowed them, and left out a group with none.
 *
 * The arrow keys run through every group's items as one list, past the labels.
 */
export function ComboboxGroup({
  disabled = false,
  className,
  children,
  render,
  ...rest
}: ComboboxGroupProps) {
  useComboboxRootContext('Group');
  const labelId = `${useId()}-label`;
  // Named only once a GroupLabel is there to name it.
  const [hasLabel, setHasLabel] = useState(false);
  const registerLabel = useCallback(() => {
    setHasLabel(true);
    return () => setHasLabel(false);
  }, []);
  const context = useMemo(
    () => ({ disabled, labelId, registerLabel }),
    [disabled, labelId, registerLabel],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      'aria-labelledby': hasLabel ? labelId : undefined,
      'data-disabled': disabled ? '' : undefined,
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });

  return <ComboboxGroupContext.Provider value={context}>{element}</ComboboxGroupContext.Provider>;
}
