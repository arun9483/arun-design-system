import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type InputOwnProps = {
  /**
   * Content placed before the text, inside the box — an icon, a prefix like `https://`,
   * or a button. Decorative icons should carry `aria-hidden`.
   */
  startSlot?: React.ReactNode;
  /** Content placed after the text, inside the box — a unit, a clear or reveal button. */
  endSlot?: React.ReactNode;
  /**
   * Classes for the box that frames the input and its slots — size it, place it. Every
   * other prop goes to the `<input>` itself.
   */
  className?: string;
  /**
   * Element or component to render instead of the `<input>`. The box and slots stay;
   * props and ref are merged onto it.
   *
   * @example <Input render={<MaskedInput mask="99/99" />} />
   */
  render?: React.ReactElement;
  /** Ref to the `<input>`, so `register()` and focus management reach the control. */
  ref?: React.Ref<HTMLInputElement>;
};

export type InputProps = InputOwnProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof InputOwnProps | 'children'>;

/**
 * A native text `<input>` inside a styled box. No behaviour of its own: focus, typing,
 * validation and form participation are the platform's, so there is no headless half —
 * decision 7.
 *
 * The box always renders, with or without slots, so `className` and every other prop
 * land on the same element whichever way the input is used.
 */
export function Input({ startSlot, endSlot, className, render, ...rest }: InputProps) {
  const control = useRender({
    render,
    defaultTagName: 'input',
    props: { className: 'input-control' },
    consumerProps: rest,
  });

  return (
    <div className={cn('input', className)}>
      {startSlot != null && <span className="input-slot input-slot-start">{startSlot}</span>}
      {control}
      {endSlot != null && <span className="input-slot input-slot-end">{endSlot}</span>}
    </div>
  );
}
