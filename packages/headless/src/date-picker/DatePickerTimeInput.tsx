import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useDatePickerRootContext } from './DatePickerRootContext';

type DatePickerTimeInputOwnProps = {
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the input. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLInputElement>;
};

export type DatePickerTimeInputProps = DatePickerTimeInputOwnProps &
  Omit<ComponentPropsWithRef<'input'>, keyof DatePickerTimeInputOwnProps | 'type' | 'value'>;

function useTimeInputPart(
  which: 'single' | 'start' | 'end',
  part: string,
  { render, ...rest }: DatePickerTimeInputProps,
) {
  const context = useDatePickerRootContext(part);
  const slot = context.time[which];
  if (!slot) {
    throw new Error(
      `<DatePicker.${part}> needs \`withTime\` on its ${which === 'single' ? 'Root' : 'RangeRoot'}.`,
    );
  }
  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      type: 'time',
      value: slot.value,
      disabled: context.disabled || undefined,
      'aria-label': slot.label,
      onChange: slot.onChange,
    },
    consumerProps: rest as UnknownProps,
  });
}

/**
 * A native `<input type="time">` for the Popup, with `withTime`: it sets the time part of the
 * value, so the time can be chosen beside the calendar, with the browser's own time picker. Not
 * a form field — the date input holds the value. A time chosen before any date is used by the
 * first pick.
 */
export function DatePickerTimeInput(props: DatePickerTimeInputProps) {
  return useTimeInputPart('single', 'TimeInput', props);
}

/** A range's start time, for the Popup. Named "Start time" unless labelled otherwise. */
export function DatePickerStartTimeInput(props: DatePickerTimeInputProps) {
  return useTimeInputPart('start', 'StartTimeInput', props);
}

/** A range's end time, for the Popup. Named "End time" unless labelled otherwise. */
export function DatePickerEndTimeInput(props: DatePickerTimeInputProps) {
  return useTimeInputPart('end', 'EndTimeInput', props);
}
