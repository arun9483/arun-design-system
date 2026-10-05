import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { endOfMonth, formatDate } from './dates';
import { useCalendarRootContext } from './CalendarRootContext';

type CalendarSelectOwnProps = {
  /** Element to render instead of the default `<select>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type CalendarSelectProps = CalendarSelectOwnProps &
  Omit<ComponentPropsWithRef<'select'>, keyof CalendarSelectOwnProps | 'value' | 'children'>;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A native `<select>` of the months, showing the first month shown: picking one goes there, in the
 * same year. Months wholly outside `min` and `max` are disabled. Named "Month".
 */
export function CalendarMonthSelect({ className, render, ...rest }: CalendarSelectProps) {
  const { visibleStart, showMonth, min, max, locale, labels } =
    useCalendarRootContext('MonthSelect');
  const year = visibleStart.slice(0, 4);
  return useRender({
    render,
    defaultTagName: 'select',
    props: {
      'aria-label': labels.month,
      value: visibleStart.slice(5, 7),
      className,
      onChange(event: { currentTarget: HTMLSelectElement }) {
        showMonth(`${year}-${event.currentTarget.value}-01`);
      },
      children: Array.from({ length: 12 }, (_, index) => {
        const first = `${year}-${pad(index + 1)}-01`;
        const outside =
          (min !== undefined && endOfMonth(first) < min) || (max !== undefined && first > max);
        return (
          <option key={first} value={pad(index + 1)} disabled={outside}>
            {formatDate(first, locale, { month: 'long' })}
          </option>
        );
      }),
    },
    consumerProps: rest as UnknownProps,
  });
}
