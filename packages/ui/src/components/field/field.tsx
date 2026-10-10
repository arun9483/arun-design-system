'use client';

import { Field as Headless } from '@arun-dev/headless/field';
import type {
  FieldRootProps,
  FieldLabelProps,
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
} from '@arun-dev/headless/field';
import { Input } from '../input';
import { cn } from '../../lib/cn';

/** A label, a description and an error around one control, stacked. */
export function FieldRoot({ className, ...props }: FieldRootProps) {
  return <Headless.Root {...props} className={cn('field', className)} />;
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <Headless.Label {...props} className={cn('field-label', className)} />;
}

/**
 * The control. An `Input` unless `render` gives another — `<Select />`, `<Textarea />`,
 * `<Checkbox.Root />`, `<Combobox.Input />`. Other props go to it.
 */
export function FieldControl({ render = <Input />, ...props }: FieldControlProps) {
  return <Headless.Control {...props} render={render} />;
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return <Headless.Description {...props} className={cn('field-description', className)} />;
}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return <Headless.Error {...props} className={cn('field-error', className)} />;
}
