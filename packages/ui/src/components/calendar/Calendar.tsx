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

/** Previous, the month or months, and Next; then a Grid per month. */
function CalendarBody({ months }: { months: number }) {
  return (
    <>
      <div className="calendar-header">
        <Headless.PrevButton className="calendar-nav">
          <Chevron />
        </Headless.PrevButton>
        <Headless.Heading className="calendar-heading" />
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

export type CalendarProps = Omit<CalendarRootProps, 'children'>;

/** A month to pick a day from. Selection, keyboard and dates come from @arun-dev/headless. */
export function Calendar({ months = 1, className, ...props }: CalendarProps) {
  return (
    <Headless.Root
      {...props}
      months={months}
      className={cn('calendar', months > 1 && 'calendar-multiple', className)}
    >
      <CalendarBody months={months} />
    </Headless.Root>
  );
}

export type RangeCalendarProps = Omit<CalendarRangeRootProps, 'children'>;

/** A month, or several, to pick a range of days from: a first press starts it, a second ends it. */
export function RangeCalendar({ months = 1, className, ...props }: RangeCalendarProps) {
  return (
    <Headless.RangeRoot
      {...props}
      months={months}
      className={cn('calendar', months > 1 && 'calendar-multiple', className)}
    >
      <CalendarBody months={months} />
    </Headless.RangeRoot>
  );
}
