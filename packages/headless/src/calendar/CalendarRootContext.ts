import { createContext, useContext } from 'react';
import type { CalendarDayPropsGetter, CalendarDayTags } from './useDayInfo';

/** A range of days, both ends included: ISO dates, `start` on or before `end`. */
export type DateRange = { start: string; end: string };

/** What a day is, for its attributes and its styling. */
export type CalendarDayState = {
  /** The selected day, or either end of the selected range. */
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  /** Between the ends of the range, ends included — the selected one, or the one being picked. */
  inRange: boolean;
  today: boolean;
  /** Outside `min` and `max`, unavailable, or out of reach of the range being picked. */
  disabled: boolean;
};

/** Labels for what has no visible text, in English unless replaced. */
export type CalendarLabels = {
  previous: string;
  next: string;
  /** The MonthSelect's name. */
  month: string;
  /** The YearSelect's name. */
  year: string;
};

export const DEFAULT_CALENDAR_LABELS: CalendarLabels = {
  previous: 'Previous month',
  next: 'Next month',
  month: 'Month',
  year: 'Year',
};

/** What Calendar's Root shares with its parts. */
export type CalendarRootContextValue = {
  locale: string | undefined;
  /** 0 for Sunday to 6 for Saturday. */
  firstDayOfWeek: number;
  /** The first day of the first month shown. */
  visibleStart: string;
  months: number;
  /** The day holding the grid's Tab stop, and where the arrow keys move from. */
  focusedDate: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  goPrevious: () => void;
  goNext: () => void;
  /** Shows the month starting on this day as the first one, the Tab stop moving with it. */
  showMonth: (firstOfMonth: string) => void;
  min: string | undefined;
  max: string | undefined;
  /** Today, or `null` until the client knows it. */
  today: string | null;
  dayState: (iso: string) => CalendarDayState;
  select: (iso: string) => void;
  /** Moves the Tab stop to a day, showing its month; `moveFocus` focuses it too. */
  focusDate: (iso: string, moveFocus: boolean) => void;
  /** The day under the pointer or focus, for a range's preview. */
  setHovered: (iso: string | null) => void;
  registerDay: (iso: string, element: HTMLElement | null) => void;
  labels: CalendarLabels;
  /** What `getDayInfo` says about a day: its tags, its mark, its description and details. */
  dayInfo: (iso: string) => CalendarDayTags;
  /** Extra attributes for a day's button. */
  dayProps: CalendarDayPropsGetter | undefined;
  /** The details card: the day it is open for, its id, the anchor it follows, and the setter. */
  details: {
    date: string | null;
    id: string;
    anchorName: string;
    show: (date: string | null, delay?: number) => void;
  };
  /** Day information is still loading. */
  loading: boolean;
};

export const CalendarRootContext = createContext<CalendarRootContextValue | null>(null);

export function useCalendarRootContext(part: string): CalendarRootContextValue {
  const context = useContext(CalendarRootContext);
  if (context === null) {
    throw new Error(
      `<Calendar.${part}> must be rendered inside <Calendar.Root> or <Calendar.RangeRoot>.`,
    );
  }
  return context;
}

/**
 * What a DatePicker gives the Calendar inside its Popup: the picker's value and constraints, and
 * where a pick goes. A Root's own props win over it. `openCount` changes each time the picker
 * opens, so the calendar starts again at the selected day and takes focus.
 */
export type CalendarBinding = {
  min?: string;
  max?: string;
  isDateUnavailable?: (iso: string) => boolean;
  maxDays?: number;
  openCount: number;
} & (
  | { mode: 'single'; value: string | null; pick: (iso: string) => void }
  | { mode: 'range'; value: DateRange | null; pick: (range: DateRange) => void }
);

export const CalendarBindingContext = createContext<CalendarBinding | null>(null);
