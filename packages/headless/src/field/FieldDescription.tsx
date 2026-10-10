'use client';

import { useLayoutEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { fieldDataAttributes, useFieldRootContext } from './FieldRootContext';

type FieldDescriptionOwnProps = {
  /** Element to render instead of the default `<p>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type FieldDescriptionProps = FieldDescriptionOwnProps &
  Omit<ComponentPropsWithRef<'p'>, keyof FieldDescriptionOwnProps>;

/**
 * Help text under the control, read out with it through `aria-describedby`.
 */
export function FieldDescription({ className, children, render, ...rest }: FieldDescriptionProps) {
  const context = useFieldRootContext('Description');
  const { descriptionId, registerDescription, invalid, disabled, required } = context;
  useLayoutEffect(registerDescription, [registerDescription]);

  return useRender({
    render,
    defaultTagName: 'p',
    props: {
      id: descriptionId,
      ...fieldDataAttributes({ invalid, disabled, required }),
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });
}
