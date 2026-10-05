import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { anchorNameFor } from '../core/anchoring';
import { useLatest } from '../core/useLatest';
import { addMonths, endOfMonth } from './dates';

/** What `getDayInfo` says about a day. Every field is optional. */
export type CalendarDayInfo = {
  /**
   * Names for what the day is, such as `'holiday'`, `'festival'` or `'booked'`. Any number, in any
   * order; falsy entries are dropped, so `isWeekend && 'weekend'` can sit in the list.
   */
  tags?: readonly (string | false | null | undefined)[];
  /** Words added to the day's accessible name, such as "Diwali, public holiday". */
  description?: string;
  /** Read-only content for the details card shown on hover, focus or a tap. No links or buttons. */
  details?: ReactNode;
};

/** The days shown: the first day of the first month to the last day of the last. */
export type CalendarVisibleRange = { start: string; end: string };

/** A day's tags as the calendar uses them: the list, and the one that draws its mark. */
export type CalendarDayTags = {
  tags: string[];
  /** The tag highest in `tagPriority`, or `null` when none of them is present. */
  mark: string | null;
  description: string | undefined;
  details: ReactNode;
};

export const DEFAULT_TAG_PRIORITY: readonly string[] = [
  'booked',
  'holiday',
  'festival',
  'birthday',
];

/** How long the pointer rests on a day before its card opens: a sweep across the grid opens none. */
export const DETAILS_DELAY = 400;

const NONE: CalendarDayTags = { tags: [], mark: null, description: undefined, details: undefined };

export type DayInfoConfig = {
  getDayInfo: ((date: string) => CalendarDayInfo | null | undefined) | undefined;
  tagPriority: readonly string[] | undefined;
  onVisibleRangeChange: ((range: CalendarVisibleRange) => void) | undefined;
  visibleStart: string;
  months: number;
};

/**
 * Day information and the details card: what each day's tags are and which one marks it, which
 * day's card is open, and reporting the days shown so their information can be fetched.
 */
export function useDayInfo({
  getDayInfo,
  tagPriority = DEFAULT_TAG_PRIORITY,
  onVisibleRangeChange,
  visibleStart,
  months,
}: DayInfoConfig) {
  const dayInfo = (date: string): CalendarDayTags => {
    const info = getDayInfo?.(date);
    if (!info) return NONE;
    const tags = (info.tags ?? []).filter((tag): tag is string => !!tag);
    return {
      tags,
      mark: tagPriority.find((tag) => tags.includes(tag)) ?? null,
      description: info.description || undefined,
      details: info.details,
    };
  };

  // The days shown, reported when the calendar mounts and whenever they change.
  const report = useLatest(onVisibleRangeChange);
  useEffect(() => {
    report.current?.({ start: visibleStart, end: endOfMonth(addMonths(visibleStart, months - 1)) });
  }, [visibleStart, months, report]);

  // The details card: one for the calendar, following the day it is open for.
  const id = useId();
  const [detailsDate, setDetailsDate] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const showDetails = useCallback((date: string | null, delay = 0) => {
    clearTimeout(timer.current);
    if (delay === 0) setDetailsDate(date);
    else timer.current = setTimeout(() => setDetailsDate(date), delay);
  }, []);

  return {
    dayInfo,
    details: {
      date: detailsDate,
      id: `${id}-details`,
      anchorName: anchorNameFor(`${id}-details`),
      show: showDetails,
    },
  };
}

/** Extra attributes for one day's button, from its date and what it is: per-day styling. */
export type CalendarDayPropsGetter = (
  date: string,
  day: CalendarDayTags,
) => HTMLAttributes<HTMLButtonElement> | undefined;
