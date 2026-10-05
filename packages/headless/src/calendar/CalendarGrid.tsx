import { createElement } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import { mergeProps, type UnknownProps } from '../core/mergeProps';
import { DETAILS_DELAY } from './useDayInfo';
import { addDays, addMonths, dayOfWeek, endOfMonth, formatDate } from './dates';
import { useCalendarRootContext } from './CalendarRootContext';
import { calendarDayDataAttributes } from './calendarDataAttributes';

type CalendarGridOwnProps = {
  /** Which month this Grid shows, counted from the first one shown: `1` for the second. */
  offset?: number;
  /** Element to render instead of the default `<table>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type CalendarGridProps = CalendarGridOwnProps &
  Omit<ComponentPropsWithRef<'table'>, keyof CalendarGridOwnProps>;

/** A Sunday, from which a week's days are named. */
const A_SUNDAY = '2023-01-01';

/**
 * One month: a `<table role="grid">` named by its `<caption>`, the month, with the weekdays and a
 * button per day, named with its full date. One Tab stop for every Grid of the calendar; the arrow keys move a day or a week,
 * Home and End to the week's ends, Page Up and Page Down a month, with Shift a year — showing
 * the month they reach. Disabled days stay focusable, so the arrows keep moving by the
 * calendar; they cannot be picked.
 */
export function CalendarGrid({ offset = 0, className, render, ...rest }: CalendarGridProps) {
  const calendar = useCalendarRootContext('Grid');
  const { locale, firstDayOfWeek, focusedDate, registerDay, focusDate, setHovered, select } =
    calendar;
  const first = addMonths(calendar.visibleStart, offset);
  const last = endOfMonth(first);

  // The month's days in weeks, with blanks before the 1st and after the last.
  const weeks: (string | null)[][] = [];
  let week: (string | null)[] = Array.from(
    { length: (dayOfWeek(first) - firstDayOfWeek + 7) % 7 },
    () => null,
  );
  for (let day = first; day <= last; day = addDays(day, 1)) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0)
    weeks.push([...week, ...Array.from({ length: 7 - week.length }, () => null)]);

  const weekdays = Array.from({ length: 7 }, (_, index) =>
    addDays(A_SUNDAY, (firstDayOfWeek + index) % 7),
  );

  const { details, dayInfo, dayProps, loading } = calendar;

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && details.date !== null) {
      // Esc hides the card first. Cancelling the keydown keeps it from closing a picker's
      // popup too; the next Esc does that.
      event.preventDefault();
      details.show(null);
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? -1 : 1;
    const fromWeekStart = (dayOfWeek(focusedDate) - firstDayOfWeek + 7) % 7;
    const next = {
      ArrowRight: () => addDays(focusedDate, forward),
      ArrowLeft: () => addDays(focusedDate, -forward),
      ArrowDown: () => addDays(focusedDate, 7),
      ArrowUp: () => addDays(focusedDate, -7),
      Home: () => addDays(focusedDate, -fromWeekStart),
      End: () => addDays(focusedDate, 6 - fromWeekStart),
      PageUp: () => addMonths(focusedDate, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusedDate, event.shiftKey ? 12 : 1),
    }[event.key];
    if (!next || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    focusDate(next(), true);
  };

  return useRender({
    render,
    defaultTagName: 'table',
    props: {
      role: 'grid',
      'aria-busy': loading || undefined,
      className,
      onKeyDown,
      onPointerLeave(event: ReactPointerEvent<HTMLElement>) {
        setHovered(null);
        // The pointer's card closes with it; a card for the day with focus stays.
        const focusInside = event.currentTarget.contains(document.activeElement);
        details.show(focusInside && details.date === focusedDate ? details.date : null);
      },
      onBlur(event: ReactFocusEvent<HTMLElement>) {
        // Focus leaving every grid of the calendar closes the card.
        const next = event.relatedTarget as Element | null;
        if (!next?.closest('[role="grid"]')) details.show(null);
      },
      children: (
        <>
          {/* Names the grid. Visible or not is the styling's: with one month, the Heading says it. */}
          <caption>{formatDate(first, locale, { month: 'long', year: 'numeric' })}</caption>
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th key={day} scope="col" abbr={formatDate(day, locale, { weekday: 'long' })}>
                  {formatDate(day, locale, { weekday: 'short' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((days) => (
              <tr key={days.find(Boolean)}>
                {days.map((day, index) => {
                  if (day === null) return <td key={index} />;
                  const state = calendar.dayState(day);
                  const info = dayInfo(day);
                  const hasDetails = info.details != null && info.details !== false;
                  const cardOpen = details.date === day && hasDetails;
                  const name = formatDate(day, locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  const own = {
                    type: 'button',
                    ref: (element: HTMLElement | null) => registerDay(day, element),
                    tabIndex: day === focusedDate ? 0 : -1,
                    'aria-label': info.description ? `${name}, ${info.description}` : name,
                    'aria-current': state.today ? 'date' : undefined,
                    'aria-disabled': state.disabled || undefined,
                    // The open card describes its day, as a tooltip does.
                    'aria-describedby': cardOpen ? details.id : undefined,
                    'data-tags': info.tags.length > 0 ? info.tags.join(' ') : undefined,
                    'data-mark': info.mark ?? undefined,
                    ...calendarDayDataAttributes(state),
                    // The card is placed against the day it is open for.
                    style: details.date === day ? { anchorName: details.anchorName } : undefined,
                    onClick: () => select(day),
                    onFocus: () => {
                      focusDate(day, false);
                      setHovered(day);
                      // Focus — a key, a click, a tap — opens the card at once.
                      details.show(hasDetails ? day : null);
                    },
                    onPointerEnter: (event: ReactPointerEvent) => {
                      setHovered(day);
                      // A resting mouse opens it after a delay; touch opens it through focus.
                      if (event.pointerType === 'mouse') {
                        details.show(hasDetails ? day : null, hasDetails ? DETAILS_DELAY : 0);
                      }
                    },
                    children: formatDate(day, locale, { day: 'numeric' }),
                  };
                  return (
                    <td
                      key={day}
                      aria-selected={state.selected || state.inRange}
                      aria-disabled={state.disabled || undefined}
                    >
                      {createElement(
                        'button',
                        mergeProps(own, dayProps?.(day, info) as UnknownProps | undefined),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </>
      ),
    },
    consumerProps: rest as UnknownProps,
  });
}
