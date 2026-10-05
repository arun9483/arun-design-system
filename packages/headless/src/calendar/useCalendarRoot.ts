import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  clamp,
  endOfMonth,
  firstDayOfWeekFor,
  startOfMonth,
  today,
} from './dates';
import { useLocale, useToday } from './useClientDates';
import {
  DEFAULT_CALENDAR_LABELS,
  type CalendarDayState,
  type CalendarLabels,
  type CalendarRootContextValue,
  type DateRange,
} from './CalendarRootContext';

/** The days a range can still reach from its first pick before running into one it cannot. */
const MAX_REACH = 3660;

export type CalendarSelection =
  | { mode: 'single'; value: string | null; onSelect: (iso: string) => void }
  | { mode: 'range'; value: DateRange | null; onSelect: (range: DateRange) => void };

export type CalendarConfig = {
  selection: CalendarSelection;
  min: string | undefined;
  max: string | undefined;
  isDateUnavailable: ((iso: string) => boolean) | undefined;
  /** The most days a range may cover, both ends included. */
  maxDays: number | undefined;
  months: number;
  locale: string | undefined;
  firstDayOfWeek: number | undefined;
  labels: Partial<CalendarLabels> | undefined;
  /** Changes each time a DatePicker opens: start again at the selected day, and take focus. */
  openCount: number | undefined;
};

function ordered(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

/**
 * The state and behaviour both Roots share: which month is shown, which day has the Tab stop,
 * the first pick of a range, and what each day is. The selection itself is the Root's.
 */
export function useCalendarRoot({
  selection,
  min,
  max,
  isDateUnavailable,
  maxDays,
  months,
  locale: localeProp,
  firstDayOfWeek: firstDayOfWeekProp,
  labels,
  openCount,
}: CalendarConfig): CalendarRootContextValue {
  const locale = useLocale(localeProp);
  const todayIso = useToday();
  const localeFirstDay = useMemo(() => firstDayOfWeekFor(locale), [locale]);
  const selectedStart = selection.mode === 'single' ? selection.value : selection.value?.start;
  // Before the client knows today, the server's today will do as a starting month.
  const startingDay = () => clamp(selectedStart ?? todayIso ?? today(), min, max);

  const [focusedDate, setFocusedDate] = useState(startingDay);
  const [visibleStart, setVisibleStart] = useState(() => startOfMonth(focusedDate));
  // The first pick of a range, until the second completes it.
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Elements only to move focus to, never read (decision 10).
  const days = useRef(new Map<string, HTMLElement>());
  const registerDay = useCallback((iso: string, element: HTMLElement | null) => {
    if (element) days.current.set(iso, element);
    else days.current.delete(iso);
  }, []);
  // A request to focus the focused day once it is rendered; the tick makes sure a render follows.
  const pendingFocus = useRef(false);
  const [, setFocusTick] = useState(0);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const element = days.current.get(focusedDate);
    if (!element) return;
    pendingFocus.current = false;
    element.focus();
  });

  const lastVisibleStart = addMonths(visibleStart, months - 1);
  const show = useCallback(
    (iso: string) =>
      setVisibleStart((current) => {
        if (iso < current) return startOfMonth(iso);
        if (iso > endOfMonth(addMonths(current, months - 1))) {
          return addMonths(startOfMonth(iso), -(months - 1));
        }
        return current;
      }),
    [months],
  );

  const focusDate = useCallback(
    (iso: string, moveFocus: boolean) => {
      const day = clamp(iso, min, max);
      setFocusedDate(day);
      show(day);
      if (moveFocus) {
        pendingFocus.current = true;
        setFocusTick((tick) => tick + 1);
      }
    },
    [min, max, show],
  );

  // A DatePicker opened: start again from the selection, and focus it once the popup shows.
  const seenOpenCount = useRef(openCount);
  useEffect(() => {
    if (openCount === undefined || openCount === seenOpenCount.current) return;
    seenOpenCount.current = openCount;
    const day = startingDay();
    setVisibleStart(startOfMonth(day));
    setAnchor(null);
    setHovered(null);
    focusDate(day, true);
    // Only the open itself restarts the calendar, not a change of selection while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [openCount]);

  const unavailable = useCallback(
    (iso: string) =>
      (min !== undefined && iso < min) ||
      (max !== undefined && iso > max) ||
      !!isDateUnavailable?.(iso),
    [min, max, isDateUnavailable],
  );

  // While a range is half picked, the days it can still reach: at most `maxDays` long, and not
  // across a day that cannot be picked.
  const reach = useMemo(() => {
    if (selection.mode !== 'range' || anchor === null) return null;
    const limit = maxDays ? maxDays - 1 : MAX_REACH;
    let low = anchor;
    let high = anchor;
    for (let step = 0; step < limit; step += 1) {
      const previous = addDays(low, -1);
      if (unavailable(previous)) break;
      low = previous;
    }
    for (let step = 0; step < limit; step += 1) {
      const next = addDays(high, 1);
      if (unavailable(next)) break;
      high = next;
    }
    return [low, high] as const;
  }, [selection.mode, anchor, maxDays, unavailable]);

  const isDisabled = useCallback(
    (iso: string) => unavailable(iso) || (reach !== null && (iso < reach[0] || iso > reach[1])),
    [unavailable, reach],
  );

  // The range shown: the one being picked, toward the day under the pointer or focus, else the
  // selected one.
  const [rangeStart, rangeEnd] =
    selection.mode !== 'range'
      ? [null, null]
      : anchor !== null
        ? ordered(anchor, hovered !== null && !isDisabled(hovered) ? hovered : anchor)
        : [selection.value?.start ?? null, selection.value?.end ?? null];

  const dayState = (iso: string): CalendarDayState => {
    const start = iso === rangeStart;
    const end = iso === rangeEnd;
    return {
      selected: selection.mode === 'single' ? iso === selection.value : start || end,
      rangeStart: start,
      rangeEnd: end,
      inRange: rangeStart !== null && rangeEnd !== null && iso >= rangeStart && iso <= rangeEnd,
      today: iso === todayIso,
      disabled: isDisabled(iso),
    };
  };

  const select = (iso: string) => {
    if (isDisabled(iso)) return;
    setFocusedDate(iso);
    if (selection.mode === 'single') {
      selection.onSelect(iso);
    } else if (anchor === null) {
      setAnchor(iso);
    } else {
      const [start, end] = ordered(anchor, iso);
      setAnchor(null);
      setHovered(null);
      selection.onSelect({ start, end });
    }
  };

  const canGoPrevious = min === undefined || visibleStart > startOfMonth(min);
  const canGoNext = max === undefined || lastVisibleStart < startOfMonth(max);
  // A page moves by a month, and the Tab stop with it, kept inside what is shown.
  const page = (months_: number) => {
    const start = addMonths(visibleStart, months_);
    setVisibleStart(start);
    const lowest = min !== undefined && min > start ? min : start;
    const end = endOfMonth(addMonths(start, months - 1));
    const highest = max !== undefined && max < end ? max : end;
    setFocusedDate(clamp(addMonths(focusedDate, months_), lowest, highest));
  };

  return {
    locale,
    firstDayOfWeek: firstDayOfWeekProp ?? localeFirstDay,
    visibleStart,
    months,
    focusedDate,
    canGoPrevious,
    canGoNext,
    goPrevious: () => page(-1),
    goNext: () => page(1),
    showMonth(firstOfMonth: string) {
      const [y = 0, m = 1] = firstOfMonth.split('-').map(Number);
      const [vy = 0, vm = 1] = visibleStart.split('-').map(Number);
      const months_ = (y - vy) * 12 + (m - vm);
      if (months_ !== 0) page(months_);
    },
    min,
    max,
    today: todayIso,
    dayState,
    select,
    focusDate,
    setHovered,
    registerDay,
    labels: { ...DEFAULT_CALENDAR_LABELS, ...labels },
  };
}
