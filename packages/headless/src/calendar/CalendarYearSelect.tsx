import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { clamp, startOfMonth } from './dates';
import { useCalendarRootContext } from './CalendarRootContext';
import type { CalendarSelectProps } from './CalendarMonthSelect';

/** Years offered either side of this one when `min` or `max` does not bound them. */
const YEARS_BACK = 100;
const YEARS_AHEAD = 10;

/**
 * A native `<select>` of the years, showing the first month's: picking one goes there, in the same
 * month, kept within `min` and `max`. The years run from `min`'s to `max`'s, or else from 100 years
 * ago to 10 ahead — set `max` for a date of birth. Named "Year".
 */
export function CalendarYearSelect({ className, render, ...rest }: CalendarSelectProps) {
  const { visibleStart, showMonth, min, max, today, locale, labels } =
    useCalendarRootContext('YearSelect');
  const shown = Number(visibleStart.slice(0, 4));
  const thisYear = Number((today ?? visibleStart).slice(0, 4));
  const first = Math.min(min ? Number(min.slice(0, 4)) : thisYear - YEARS_BACK, shown);
  const last = Math.max(max ? Number(max.slice(0, 4)) : thisYear + YEARS_AHEAD, shown);
  const digits = new Intl.NumberFormat(locale, { useGrouping: false });

  return useRender({
    render,
    defaultTagName: 'select',
    props: {
      'aria-label': labels.year,
      value: String(shown),
      className,
      onChange(event: { currentTarget: HTMLSelectElement }) {
        const year = event.currentTarget.value.padStart(4, '0');
        const target = `${year}${visibleStart.slice(4)}`;
        const lowest = min ? startOfMonth(min) : undefined;
        const highest = max ? startOfMonth(max) : undefined;
        showMonth(clamp(target, lowest, highest));
      },
      children: Array.from({ length: last - first + 1 }, (_, index) => (
        <option key={first + index} value={String(first + index)}>
          {digits.format(first + index)}
        </option>
      )),
    },
    consumerProps: rest as UnknownProps,
  });
}
