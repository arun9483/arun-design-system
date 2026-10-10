'use client';

import type React from 'react';
import { OtpInput as Headless } from '@arun-dev/headless/otp-input';
import type { OtpInputRootProps } from '@arun-dev/headless/otp-input';
import { cn } from '../../lib/cn';

type OtpInputOwnProps = Pick<
  OtpInputRootProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onComplete'
  | 'length'
  | 'validationType'
  | 'disabled'
> & {
  /** Classes for the row of boxes — size it, place it. Every other prop goes to the `<input>`. */
  className?: string;
  /** Ref to the `<input>`, so focus management and a form library's focus-on-error reach it. */
  ref?: React.Ref<HTMLInputElement>;
};

export type OtpInputProps = OtpInputOwnProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof OtpInputOwnProps | 'type' | 'children'>;

/**
 * A one-time code: one box per character, `length` of them, over a single native `<input>`.
 * All behaviour comes from @arun-dev/headless; this adds the boxes and their styling.
 *
 * Like Input, `className` goes on the row and every other prop on the `<input>` — `name`,
 * `required`, `aria-*`, `autoFocus` — so a Field's attributes land on the control.
 */
export function OtpInput({
  value,
  defaultValue,
  onValueChange,
  onComplete,
  length = 6,
  validationType,
  disabled,
  className,
  ...rest
}: OtpInputProps) {
  return (
    <Headless.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onComplete={onComplete}
      length={length}
      validationType={validationType}
      disabled={disabled}
      className={cn('otp-input', className)}
      style={{ '--otp-input-length': length } as React.CSSProperties}
    >
      <Headless.Input {...rest} className="otp-input-control" />
      {Array.from({ length }, (_, index) => (
        <Headless.Slot key={index} index={index} className="otp-input-slot" />
      ))}
    </Headless.Root>
  );
}
