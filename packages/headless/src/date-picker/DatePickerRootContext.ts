import { createContext, useContext } from 'react';
import type { ChangeEvent, RefObject } from 'react';

/** Labels for what has no visible text, in English unless replaced. */
export type DatePickerLabels = {
  /** The Trigger's name, followed by the date when one is chosen. */
  choose: string;
  /** The Popup's name. */
  dialog: string;
  /** A range's first input. */
  start: string;
  /** A range's last input. */
  end: string;
  /** The validation message for a typed date that `isDateUnavailable` rules out. */
  unavailable: string;
};

/** One native input, as the Root runs it. */
export type DateInputSlot = {
  ref: RefObject<HTMLInputElement | null>;
  /** Controlled: what the input shows. `undefined` leaves the value to the input. */
  value: string | undefined;
  /** Uncontrolled: what the input starts with, and returns to on `form.reset()`. */
  defaultValue: string | undefined;
  min: string | undefined;
  max: string | undefined;
  /** The input's validation message: the unavailable message, or none. */
  validity: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The input's name when it has no `aria-label` or label of its own. */
  label: string | undefined;
};

export type DatePickerRootContextValue = {
  withTime: boolean;
  disabled: boolean;
  single: DateInputSlot | null;
  start: DateInputSlot | null;
  end: DateInputSlot | null;
  /** The Trigger's name, with the chosen date or range. */
  triggerLabel: string;
  labels: DatePickerLabels;
};

export const DatePickerRootContext = createContext<DatePickerRootContextValue | null>(null);

export function useDatePickerRootContext(part: string): DatePickerRootContextValue {
  const context = useContext(DatePickerRootContext);
  if (context === null) {
    throw new Error(
      `<DatePicker.${part}> must be rendered inside <DatePicker.Root> or <DatePicker.RangeRoot>.`,
    );
  }
  return context;
}
