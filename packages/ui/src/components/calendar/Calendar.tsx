import { Calendar as Headless } from '@arun-dev/headless/calendar';
import type { CalendarRangeRootProps, CalendarRootProps } from '@arun-dev/headless/calendar';
import { cn } from '../../lib/cn';

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
    </>
  );
}

type CaptionOptions = {
  /**
   * `dropdown` puts month and year selects above the days, to jump straight to a month — a date
   * of birth, decades back. The years run from `min`'s to `max`'s, or 100 years back to 10 ahead.
   */
  captionLayout?: CalendarCaptionLayout;
};

export type CalendarProps = Omit<CalendarRootProps, 'children'> & CaptionOptions;

/** A month to pick a day from. Selection, keyboard and dates come from @arun-dev/headless. */
export function Calendar({
  months = 1,
  captionLayout = 'label',
  className,
  ...props
}: CalendarProps) {
  return (
    <Headless.Root
      {...props}
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
  className,
  ...props
}: RangeCalendarProps) {
  return (
    <Headless.RangeRoot
      {...props}
      months={months}
      className={cn('calendar', months > 1 && 'calendar-multiple', className)}
    >
      <CalendarBody months={months} captionLayout={captionLayout} />
    </Headless.RangeRoot>
  );
}
