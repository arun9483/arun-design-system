import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type SelectOwnProps = {
  /** The `<option>` and `<optgroup>` elements, exactly as for a native `<select>`. */
  children?: React.ReactNode;
  /**
   * Classes for the box that frames the select and its chevron — size it, place it. Every
   * other prop goes to the `<select>` itself.
   */
  className?: string;
  /**
   * Element or component to render instead of the `<select>`. The box and chevron stay;
   * props and ref are merged onto it.
   */
  render?: React.ReactElement;
  /** Ref to the `<select>`, so `register()` and focus management reach the control. */
  ref?: React.Ref<HTMLSelectElement>;
};

export type SelectProps = SelectOwnProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, keyof SelectOwnProps>;

/**
 * A native `<select>` inside a styled box. No behaviour of its own: the picker, typeahead,
 * keyboard, validation and form participation are the platform's, so there is no headless
 * half — decision 7. It does not filter; searching a long list is a combobox's job.
 *
 * The box always renders, so `className` and every other prop land on the same element
 * whichever way the select is used. The chevron is drawn by the box, not the platform, so it
 * matches across browsers.
 */
export function Select({ className, render, ...rest }: SelectProps) {
  const control = useRender({
    render,
    defaultTagName: 'select',
    props: { className: 'select-control' },
    consumerProps: rest,
  });

  return (
    <div className={cn('select', className)}>
      {control}
      <svg className="select-icon" viewBox="0 0 16 16" aria-hidden>
        <path
          d="m4 6 4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
