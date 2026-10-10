'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { fieldDataAttributes, useFieldRootContext } from './FieldRootContext';

type FieldLabelOwnProps = {
  /** Element to render instead of the default `<label>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type FieldLabelProps = FieldLabelOwnProps &
  Omit<ComponentPropsWithRef<'label'>, keyof FieldLabelOwnProps>;

/** Names the control: a `<label>` whose `htmlFor` is the control's id, so a press focuses it. */
export function FieldLabel({ className, children, render, ...rest }: FieldLabelProps) {
  const { controlId, ...state } = useFieldRootContext('Label');
  return useRender({
    render,
    defaultTagName: 'label',
    props: { htmlFor: controlId, ...fieldDataAttributes(state), className, children },
    consumerProps: rest as UnknownProps,
  });
}
