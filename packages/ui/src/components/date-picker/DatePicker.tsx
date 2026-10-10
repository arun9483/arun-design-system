'use client';

import type React from 'react';
import { DatePicker as Headless } from '@arun-dev/headless/date-picker';
import type {
  DatePickerInputProps,
  DatePickerRangeRootProps,
  DatePickerRootProps,
  DatePickerSharedProps,
} from '@arun-dev/headless/date-picker';
import type { CalendarLabels } from '@arun-dev/headless/calendar';
import {
  Calendar,
  RangeCalendar,
  type CalendarCaptionLayout,
  type CalendarProps,
} from '../calendar';
import { Button } from '../button';
import { cn } from '../../lib/cn';

function CalendarIcon() {
  return (
    <svg className="date-picker-icon" viewBox="0 0 16 16" aria-hidden>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </svg>
  );
}

/** What the Calendar in the popup takes, beyond what the picker gives it. */
type CalendarOptions = {
  /** How many months the calendar shows side by side. */
  months?: number;
  /** 0 for Sunday to 6 for Saturday. Defaults to the locale's. */
  firstDayOfWeek?: number;
  /** Labels for the calendar's Previous and Next buttons. */
  calendarLabels?: Partial<CalendarLabels>;
  /** What each day is, for marks, screen readers and the details card. See Calendar. */
  getDayInfo?: CalendarProps['getDayInfo'];
  /** The tags that may mark a day, the first winning. See Calendar. */
  tagPriority?: CalendarProps['tagPriority'];
  /** The colour and shape of each tag's mark. See Calendar. */
  tagStyles?: CalendarProps['tagStyles'];
  /** Called with the days the calendar shows, to fetch their information. See Calendar. */
  onVisibleRangeChange?: CalendarProps['onVisibleRangeChange'];
  /** Day information is loading. See Calendar. */
  loading?: boolean;
  /** Extra attributes for each day's button. See Calendar. */
  dayProps?: CalendarProps['dayProps'];
  /** `dropdown` adds month and year selects to the calendar, for dates far away: a date of birth. */
  captionLayout?: CalendarCaptionLayout;
  /** The text of the button that closes the popup, shown with `withTime`. */
  doneLabel?: string;
  /** Classes for the box around the input and the button. */
  className?: string;
};

/**
 * With `withTime`, the popup's last row: the time fields — the browser's own time inputs,
 * labelled — and Done, since a pick leaves the popup open for the time.
 */
function TimeRow({ children, doneLabel }: { children: React.ReactNode; doneLabel: string }) {
  return (
    <div className="date-picker-time">
      {children}
      <Headless.Close render={<Button variant="primary" />} className="date-picker-done">
        {doneLabel}
      </Headless.Close>
    </div>
  );
}

function TimeField({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="date-picker-time-field">
      <span className="date-picker-time-label">{label}</span>
      {children}
    </label>
  );
}

type RootKeys = keyof DatePickerRootProps | 'children';

export type DatePickerProps = Omit<DatePickerRootProps, 'children'> &
  CalendarOptions &
  Omit<DatePickerInputProps, RootKeys | 'className'>;

/**
 * A date field with a calendar button: a native date input — `datetime-local` with
 * `withTime` — and a Calendar in a popover. `className` goes on the box; every other input prop,
 * `name`, `id`, `required`, a Field's attributes and a `register()` ref, goes on the input.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  withTime,
  min,
  max,
  isDateUnavailable,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  locale,
  labels,
  months,
  firstDayOfWeek,
  calendarLabels,
  doneLabel = 'Done',
  captionLayout,
  getDayInfo,
  tagPriority,
  tagStyles,
  onVisibleRangeChange,
  loading,
  dayProps,
  className,
  ...inputProps
}: DatePickerProps) {
  return (
    <Headless.Root
      {...{ value, defaultValue, onValueChange, withTime, min, max, isDateUnavailable }}
      {...{ disabled, open, defaultOpen, onOpenChange, locale, labels }}
    >
      <div className={cn('date-picker', className)}>
        <Headless.Input {...inputProps} className="date-picker-input" />
        <Headless.Trigger className="date-picker-trigger">
          <CalendarIcon />
        </Headless.Trigger>
      </div>
      <Headless.Popup className="date-picker-popup" align="end">
        <Calendar
          locale={locale}
          months={months}
          firstDayOfWeek={firstDayOfWeek}
          labels={calendarLabels}
          captionLayout={captionLayout}
          {...{ getDayInfo, tagPriority, tagStyles, onVisibleRangeChange, loading, dayProps }}
        />
        {withTime && (
          <TimeRow doneLabel={doneLabel}>
            <TimeField label={labels?.time ?? 'Time'}>
              <Headless.TimeInput className="date-picker-time-input" />
            </TimeField>
          </TimeRow>
        )}
      </Headless.Popup>
    </Headless.Root>
  );
}

type RangeRootKeys = keyof DatePickerRangeRootProps | keyof DatePickerSharedProps | 'children';

export type DateRangePickerProps = Omit<DatePickerRangeRootProps, 'children'> &
  CalendarOptions & {
    /**
     * Props for the start input: its `name`, or everything `register('from')` returns. Each end
     * is its own native input, so each is its own field.
     */
    startInputProps?: Omit<DatePickerInputProps, 'className'>;
    /** Props for the end input: its `name`, or everything `register('to')` returns. */
    endInputProps?: Omit<DatePickerInputProps, 'className'>;
    /** Both inputs must be filled. */
    required?: boolean;
    /** The start input's id — what a Field's label points at. */
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
  } & Omit<
    React.HTMLAttributes<HTMLDivElement>,
    RangeRootKeys | 'id' | 'defaultValue' | 'onChange'
  >;

/**
 * Two date fields, the start and end of a range, with a calendar button: a RangeCalendar in a
 * popover picks both. The box is a `role="group"`: name it with `aria-label` or
 * `aria-labelledby`. Each input is named "Start date" and "End date" unless `labels` says
 * otherwise.
 */
export function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  maxDays,
  maxHours,
  withTime,
  min,
  max,
  isDateUnavailable,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  locale,
  labels,
  months,
  firstDayOfWeek,
  calendarLabels,
  doneLabel = 'Done',
  captionLayout,
  getDayInfo,
  tagPriority,
  tagStyles,
  onVisibleRangeChange,
  loading,
  dayProps,
  startInputProps,
  endInputProps,
  required,
  id,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  className,
  ...rest
}: DateRangePickerProps) {
  const shared = { required, 'aria-describedby': describedBy, 'aria-invalid': invalid };
  return (
    <Headless.RangeRoot
      {...{ value, defaultValue, onValueChange, maxDays, maxHours, withTime, min, max }}
      isDateUnavailable={isDateUnavailable}
      {...{ disabled, open, defaultOpen, onOpenChange, locale, labels }}
    >
      <div role="group" {...rest} className={cn('date-picker', 'date-range-picker', className)}>
        <Headless.StartInput
          {...shared}
          id={id}
          {...startInputProps}
          className="date-picker-input"
        />
        <span className="date-range-picker-separator" aria-hidden>
          –
        </span>
        <Headless.EndInput {...shared} {...endInputProps} className="date-picker-input" />
        <Headless.Trigger className="date-picker-trigger">
          <CalendarIcon />
        </Headless.Trigger>
      </div>
      <Headless.Popup className="date-picker-popup" align="end">
        <RangeCalendar
          locale={locale}
          months={months}
          firstDayOfWeek={firstDayOfWeek}
          labels={calendarLabels}
          captionLayout={captionLayout}
          {...{ getDayInfo, tagPriority, tagStyles, onVisibleRangeChange, loading, dayProps }}
        />
        {withTime && (
          <TimeRow doneLabel={doneLabel}>
            <TimeField label={labels?.startTime ?? 'Start time'}>
              <Headless.StartTimeInput className="date-picker-time-input" />
            </TimeField>
            <TimeField label={labels?.endTime ?? 'End time'}>
              <Headless.EndTimeInput className="date-picker-time-input" />
            </TimeField>
          </TimeRow>
        )}
      </Headless.Popup>
    </Headless.RangeRoot>
  );
}
