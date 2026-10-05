import { Calendar as Headless } from '@arun-dev/headless/calendar';
import type {
  CalendarDayPropsGetter,
  CalendarRangeRootProps,
  CalendarRootProps,
} from '@arun-dev/headless/calendar';
import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';

/** The shape of a day's mark. `strike` crosses the number out; `none` draws nothing. */
export type CalendarMarkShape = 'dot' | 'ring' | 'star' | 'diamond' | 'bar' | 'strike' | 'none';

/** How a tag's mark looks: its colour, any CSS colour or token, and its shape. */
export type CalendarTagStyle = { color?: string; mark?: CalendarMarkShape };

/**
 * `tagStyles` as per-day attributes: the marking tag's colour as `--calendar-day-mark-color` and
 * its shape as a class, merged with the consumer's own `dayProps`.
 */
function tagDayProps(
  tagStyles: Record<string, CalendarTagStyle> | undefined,
  dayProps: CalendarDayPropsGetter | undefined,
): CalendarDayPropsGetter | undefined {
  if (!tagStyles) return dayProps;
  return (date, info) => {
    const own = dayProps?.(date, info);
    const style = info.mark ? tagStyles[info.mark] : undefined;
    if (!style) return own;
    return {
      ...own,
      className: cn(style.mark && `calendar-mark-${style.mark}`, own?.className),
      style: {
        ...(style.color ? { '--calendar-day-mark-color': style.color } : {}),
        ...own?.style,
      } as CSSProperties,
    };
  };
}

function Chevron() {
  return (
    <svg className="calendar-nav-icon" viewBox="0 0 16 16" aria-hidden>
      <path d="m10 4-4 4 4 4" />
    </svg>
  );
}

/** How the month is shown above the days: as text, or as month and year selects to jump with. */
export type CalendarCaptionLayout = 'label' | 'dropdown';

/** Previous, the month or months, and Next; then a Grid per month. */
function CalendarBody({
  months,
  captionLayout,
}: {
  months: number;
  captionLayout: CalendarCaptionLayout;
}) {
  const dropdown = captionLayout === 'dropdown';
  return (
    <>
      <div className="calendar-header">
        <Headless.PrevButton className="calendar-nav">
          <Chevron />
        </Headless.PrevButton>
        {dropdown && (
          <div className="calendar-selects">
            <Headless.MonthSelect className="calendar-select" />
            <Headless.YearSelect className="calendar-select" />
          </div>
        )}
        {/* With the selects, still announced as the month changes, but not shown twice. */}
        <Headless.Heading
          className={cn('calendar-heading', dropdown && 'calendar-heading-hidden')}
        />
        <Headless.NextButton className="calendar-nav calendar-nav-next">
          <Chevron />
        </Headless.NextButton>
      </div>
      <div className="calendar-months">
        {Array.from({ length: months }, (_, offset) => (
          <Headless.Grid key={offset} offset={offset} className="calendar-grid" />
        ))}
      </div>
      {/* Shown only for days whose getDayInfo returns details. */}
      <Headless.DayDetails className="calendar-details" />
    </>
  );
}

type CaptionOptions = {
  /**
   * `dropdown` puts month and year selects above the days, to jump straight to a month — a date
   * of birth, decades back. The years run from `min`'s to `max`'s, or 100 years back to 10 ahead.
   */
  captionLayout?: CalendarCaptionLayout;
  /**
   * The colour and shape of each tag's mark, such as
   * `{ holiday: { color: 'var(--color-status-error)', mark: 'dot' } }`. Tags left out keep the
   * built-in look, from the `--calendar-tag-*` tokens.
   */
  tagStyles?: Record<string, CalendarTagStyle>;
};

export type CalendarProps = Omit<CalendarRootProps, 'children'> & CaptionOptions;

/** A month to pick a day from. Selection, keyboard and dates come from @arun-dev/headless. */
export function Calendar({
  months = 1,
  captionLayout = 'label',
  tagStyles,
  dayProps,
  className,
  ...props
}: CalendarProps) {
  return (
    <Headless.Root
      {...props}
      dayProps={tagDayProps(tagStyles, dayProps)}
      months={months}
      className={cn('calendar', months > 1 && 'calendar-multiple', className)}
    >
      <CalendarBody months={months} captionLayout={captionLayout} />
    </Headless.Root>
  );
}

export type RangeCalendarProps = Omit<CalendarRangeRootProps, 'children'> & CaptionOptions;

/** A month, or several, to pick a range of days from: a first press starts it, a second ends it. */
export function RangeCalendar({
  months = 1,
  captionLayout = 'label',
  tagStyles,
  dayProps,
  className,
  ...props
}: RangeCalendarProps) {
  return (
    <Headless.RangeRoot
      {...props}
      dayProps={tagDayProps(tagStyles, dayProps)}
      months={months}
      className={cn('calendar', months > 1 && 'calendar-multiple', className)}
    >
      <CalendarBody months={months} captionLayout={captionLayout} />
    </Headless.RangeRoot>
  );
}
