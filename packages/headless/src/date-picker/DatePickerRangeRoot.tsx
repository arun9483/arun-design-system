import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { PopoverRoot } from '../popover/PopoverRoot';
import {
  CalendarBindingContext,
  type CalendarBinding,
  type DateRange,
} from '../calendar/CalendarRootContext';
import { addDays, addHours, datePart, daysSpanned, timePart } from '../calendar/dates';
import { DatePickerRootContext, type DatePickerLabels } from './DatePickerRootContext';
import type { DatePickerSharedProps } from './DatePickerRoot';
import { inputBound, useDateInput } from './useDateInput';
import { usePickerOpen } from './usePickerOpen';
import { useLocale } from '../calendar/useClientDates';
import { describeRange } from './format';

/** A range as the inputs hold it: either end may be empty while it is typed. */
export type DateRangeValue = { start: string | null; end: string | null };

export type DatePickerRangeRootProps = DatePickerSharedProps & {
  /**
   * Controlled: the range, each end ISO 8601 and shown as the device's local date. Provide
   * `onValueChange` alongside it; `null` for none.
   */
  value?: DateRangeValue | null;
  /** Initial range when uncontrolled. Read once, at mount; `form.reset()` returns to it. */
  defaultValue?: DateRangeValue | null;
  /** Called whenever either end changes, typed or picked — once for a pick of both. */
  onValueChange?: (value: DateRangeValue) => void;
  /**
   * The most days the range may cover, both ends included: `7` allows the 1st to the 7th. The
   * Calendar stops a pick going further, and the end input's `max` stops a typed one.
   */
  maxDays?: number;
  /**
   * With `withTime`, the most hours from start to end: `40` for a 40-hour booking. The calendar
   * disables the days out of reach, a pick's end time is pulled back to start + `maxHours`, and
   * the end input's `max` stops a typed one. Ignored without `withTime`.
   */
  maxHours?: number;
};

const DEFAULT_LABELS: DatePickerLabels = {
  choose: 'Choose dates',
  dialog: 'Choose dates',
  start: 'Start date',
  end: 'End date',
  unavailable: 'This date is unavailable.',
  time: 'Time',
  startTime: 'Start time',
  endTime: 'End time',
};

/**
 * Two date fields, the start and end of a range, and a calendar to pick both from (decision
 * 27). Each field is a native input, with `min` and `max` kept in step with the other — the end
 * no earlier than the start, nor more than `maxDays` after it — so the browser validates a typed
 * range. Renders no element: StartInput, EndInput, Trigger and Popup are its parts.
 *
 * Picking keeps each end's time already set; without one, the start is midnight and the end
 * 23:59, so the range covers whole days. With `withTime` the Popup stays open after a pick, and
 * StartTimeInput and EndTimeInput in it set the times.
 */
export function DatePickerRangeRoot({
  value,
  defaultValue,
  onValueChange,
  maxDays,
  maxHours,
  withTime = false,
  min,
  max,
  isDateUnavailable,
  disabled = false,
  open: openProp,
  defaultOpen,
  onOpenChange,
  locale: localeProp,
  labels: labelsProp,
  children,
}: DatePickerRangeRootProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const locale = useLocale(localeProp);
  const controlled = value !== undefined;
  // Each input reports the whole range: its own new end, and the other end as it stands.
  const start = useDateInput({
    value: controlled ? (value?.start ?? null) : undefined,
    defaultValue: defaultValue?.start,
    withTime,
    onValueChange: (next) => onValueChange?.({ start: next, end: end.shown }),
  });
  const end = useDateInput({
    value: controlled ? (value?.end ?? null) : undefined,
    defaultValue: defaultValue?.end,
    withTime,
    onValueChange: (next) => onValueChange?.({ start: start.shown, end: next }),
  });
  const { open, setOpen, openCount } = usePickerOpen({
    open: openProp,
    defaultOpen,
    onOpenChange,
    onOpen: () => {
      start.sync();
      end.sync();
    },
    name: 'DatePicker.RangeRoot',
  });

  const startDate = datePart(start.shown);
  const endDate = datePart(end.shown);
  // Times chosen in the Popup before their dates: the pick uses them.
  const [draftStartTime, setDraftStartTime] = useState<string | null>(null);
  const [draftEndTime, setDraftEndTime] = useState<string | null>(null);
  const startTime = timePart(start.shown) ?? draftStartTime;
  const endTime = timePart(end.shown) ?? draftEndTime;
  const minDate = datePart(min) ?? undefined;
  const maxDate = datePart(max) ?? undefined;
  const hoursLimit = withTime && maxHours ? maxHours : undefined;
  // In days, for the calendar: what `maxHours` from the start's time can reach, or `maxDays`,
  // whichever is shorter.
  const hoursDays = hoursLimit ? daysSpanned(startTime ?? '00:00', hoursLimit) : undefined;
  const calendarMaxDays =
    hoursDays && maxDays ? Math.min(hoursDays, maxDays) : (hoursDays ?? maxDays);
  const binding: CalendarBinding = useMemo(
    () => ({
      mode: 'range',
      value:
        startDate && endDate && startDate <= endDate ? { start: startDate, end: endDate } : null,
      min: minDate,
      max: maxDate,
      isDateUnavailable,
      maxDays: calendarMaxDays,
      openCount,
      pick(range: DateRange) {
        const next = {
          start: withTime ? `${range.start}T${startTime ?? '00:00'}` : range.start,
          end: withTime ? `${range.end}T${endTime ?? '23:59'}` : range.end,
        };
        // An end past `maxHours` is pulled back to it: the last day is reachable, not all of it.
        if (hoursLimit) {
          const cap = addHours(next.start, hoursLimit);
          if (next.end > cap) next.end = cap;
        }
        // Both inputs hear their change; the range is reported once, whole.
        start.write(next.start, true);
        end.write(next.end, true);
        onValueChange?.(next);
        // With times, the Popup stays open for them; Done, Esc or a click outside closes it.
        if (!withTime) setOpen(false);
      },
    }),
    // write reads refs; the rest is listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
    [
      startDate,
      endDate,
      startTime,
      endTime,
      minDate,
      maxDate,
      isDateUnavailable,
      calendarMaxDays,
      hoursLimit,
      openCount,
      withTime,
      setOpen,
      onValueChange,
    ],
  );

  // The end's latest: `max`, or `maxDays` from the start, whichever comes first.
  const reach = startDate && maxDays ? addDays(startDate, maxDays - 1) : undefined;
  const endMax = reach && (!maxDate || reach < maxDate) ? reach : max;
  // With `maxHours`, no later than that from the start, to the minute.
  const endMaxInput = inputBound(endMax, withTime, 'end');
  const hoursCap = hoursLimit && start.shown ? addHours(start.shown, hoursLimit) : undefined;
  const endInputMax = hoursCap && (!endMaxInput || hoursCap < endMaxInput) ? hoursCap : endMaxInput;

  const timeSlot = (
    input: typeof start,
    date: string | null,
    shownTime: string | null,
    setDraft: (time: string) => void,
    label: string,
  ) => ({
    value: shownTime ?? '',
    label,
    onChange(event: ChangeEvent<HTMLInputElement>) {
      const next = event.currentTarget.value;
      // Emptied, the time is kept: a date-time needs one.
      if (!next) return;
      if (date) input.write(`${date}T${next}`);
      else setDraft(next);
    },
  });

  const context = {
    withTime,
    disabled,
    single: null,
    time: {
      single: null,
      start: withTime
        ? timeSlot(start, startDate, startTime, setDraftStartTime, labels.startTime)
        : null,
      end: withTime ? timeSlot(end, endDate, endTime, setDraftEndTime, labels.endTime) : null,
    },
    start: start.slot({
      min: inputBound(min, withTime, 'start'),
      max: inputBound(end.shown ?? max, withTime, 'end'),
      unavailable: isDateUnavailable,
      unavailableMessage: labels.unavailable,
      label: labels.start,
    }),
    end: end.slot({
      min: inputBound(start.shown ?? min, withTime, 'start'),
      max: endInputMax,
      unavailable: isDateUnavailable,
      unavailableMessage: labels.unavailable,
      label: labels.end,
    }),
    triggerLabel:
      start.shown && end.shown
        ? `${labels.choose}, ${describeRange(start.shown, end.shown, locale)}`
        : labels.choose,
    labels,
  };

  return (
    <DatePickerRootContext.Provider value={context}>
      <CalendarBindingContext.Provider value={binding}>
        <PopoverRoot open={open} onOpenChange={setOpen}>
          {children}
        </PopoverRoot>
      </CalendarBindingContext.Provider>
    </DatePickerRootContext.Provider>
  );
}
