import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { PopoverRoot } from '../popover/PopoverRoot';
import { CalendarBindingContext, type CalendarBinding } from '../calendar/CalendarRootContext';
import { datePart, timePart } from '../calendar/dates';
import { DatePickerRootContext, type DatePickerLabels } from './DatePickerRootContext';
import { inputBound, useDateInput } from './useDateInput';
import { usePickerOpen } from './usePickerOpen';
import { useLocale } from '../calendar/useClientDates';
import { describeValue } from './format';

/** What both Roots take besides their value. */
export type DatePickerSharedProps = {
  /** Adds the time: the input becomes `datetime-local`, and the value `YYYY-MM-DDTHH:mm`. */
  withTime?: boolean;
  /** The earliest date, as an ISO date or date-time. Checked by the input, and by the Calendar. */
  min?: string;
  /** The latest date, as an ISO date or date-time. Checked by the input, and by the Calendar. */
  max?: string;
  /** Days that cannot be picked; a typed one makes the input invalid. Called with an ISO date. */
  isDateUnavailable?: (date: string) => boolean;
  /** Disables the inputs and the Trigger. */
  disabled?: boolean;
  /** Controlled: whether the Popup is open. Provide `onOpenChange` alongside it. */
  open?: boolean;
  /** Initially open when uncontrolled. Read once, at mount. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The locale the Trigger's name is read out in. Defaults to the browser's. */
  locale?: string;
  /** Names for the Trigger, the Popup and the range's inputs, in English unless replaced. */
  labels?: Partial<DatePickerLabels>;
  children?: ReactNode;
};

export type DatePickerRootProps = DatePickerSharedProps & {
  /**
   * Controlled: the date, as ISO 8601. Shown as the device's local date: a value with `Z` or an
   * offset is converted. Provide `onValueChange` alongside it; `null` for none.
   */
  value?: string | null;
  /** Initial value when uncontrolled. Read once, at mount; `form.reset()` returns to it. */
  defaultValue?: string | null;
  /** Called with `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with `withTime`; `null` once cleared. */
  onValueChange?: (value: string | null) => void;
};

const DEFAULT_LABELS: DatePickerLabels = {
  choose: 'Choose date',
  dialog: 'Choose date',
  start: 'Start date',
  end: 'End date',
  unavailable: 'This date is unavailable.',
};

/**
 * A date field and a calendar to pick it from (decision 27). The field is a native
 * `<input type="date">` — or `datetime-local` — so typing, the phone's picker, the locale's
 * format and the form are the platform's. Renders no element: Input, Trigger and Popup are its
 * parts, and a Calendar in the Popup picks for it.
 *
 * Picking a day keeps the time already set, or uses midnight.
 */
export function DatePickerRoot({
  value,
  defaultValue,
  onValueChange,
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
}: DatePickerRootProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const locale = useLocale(localeProp);
  const input = useDateInput({
    value,
    defaultValue,
    withTime,
    onValueChange: (next) => onValueChange?.(next),
  });
  const { open, setOpen, openCount } = usePickerOpen({
    open: openProp,
    defaultOpen,
    onOpenChange,
    onOpen: input.sync,
    name: 'DatePicker.Root',
  });

  const shownDate = datePart(input.shown);
  const time = timePart(input.shown);
  const minDate = datePart(min) ?? undefined;
  const maxDate = datePart(max) ?? undefined;
  const binding: CalendarBinding = useMemo(
    () => ({
      mode: 'single',
      value: shownDate,
      min: minDate,
      max: maxDate,
      isDateUnavailable,
      openCount,
      pick(date: string) {
        input.write(withTime ? `${date}T${time ?? '00:00'}` : date);
        setOpen(false);
      },
    }),
    // input.write reads refs; the rest is listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
    [shownDate, time, minDate, maxDate, isDateUnavailable, openCount, withTime, setOpen],
  );

  const context = {
    withTime,
    disabled,
    single: input.slot({
      min: inputBound(min, withTime, 'start'),
      max: inputBound(max, withTime, 'end'),
      unavailable: isDateUnavailable,
      unavailableMessage: labels.unavailable,
      label: undefined,
    }),
    start: null,
    end: null,
    triggerLabel: input.shown
      ? `${labels.choose}, ${describeValue(input.shown, locale)}`
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
