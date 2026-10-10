'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { fieldDataAttributes, useFieldRootContext } from './FieldRootContext';

type FieldControlOwnProps = {
  /**
   * The control: `<Input />`, `<Select />`, `<Checkbox.Root />`, `<Combobox.Input />` or your
   * own. Defaults to an `<input>`. The Field's `id`, `aria-describedby`, `aria-invalid`,
   * `disabled` and `required` are merged onto it.
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type FieldControlProps = FieldControlOwnProps &
  Omit<ComponentPropsWithRef<'input'>, keyof FieldControlOwnProps>;

/**
 * Puts the Field on its control. `render` is the seam: Field does not reach into each control,
 * it hands the control the attributes that tie it to the label, description and error.
 *
 * `aria-describedby` names the Description, then the Error — only those rendered — followed by
 * any of your own. The id is the Field's: an `id` of your own breaks the Label's `htmlFor`.
 */
export function FieldControl({
  render,
  'aria-describedby': describedBy,
  ...rest
}: FieldControlProps) {
  const { controlId, descriptionId, errorId, hasDescription, hasError, ...state } =
    useFieldRootContext('Control');
  const describedByIds = [
    hasDescription ? descriptionId : undefined,
    hasError ? errorId : undefined,
    describedBy,
  ]
    .filter(Boolean)
    .join(' ');

  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      id: controlId,
      'aria-describedby': describedByIds || undefined,
      'aria-invalid': state.invalid || undefined,
      disabled: state.disabled || undefined,
      required: state.required || undefined,
      ...fieldDataAttributes(state),
    },
    consumerProps: rest as UnknownProps,
  });
}
