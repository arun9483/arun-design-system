import { useEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useDatePickerRootContext, type DatePickerRootContextValue } from './DatePickerRootContext';

type DatePickerInputOwnProps = {
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the input. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLInputElement>;
};

export type DatePickerInputProps = DatePickerInputOwnProps &
  Omit<
    ComponentPropsWithRef<'input'>,
    keyof DatePickerInputOwnProps | 'type' | 'value' | 'defaultValue' | 'min' | 'max'
  >;

type Which = 'single' | 'start' | 'end';

function useDateInputPart(which: Which, part: string, { render, ...rest }: DatePickerInputProps) {
  const context: DatePickerRootContextValue = useDatePickerRootContext(part);
  const slot = context[which];
  if (!slot) {
    throw new Error(
      which === 'single'
        ? '<DatePicker.Input> must be rendered inside <DatePicker.Root>; a range has StartInput and EndInput.'
        : `<DatePicker.${part}> must be rendered inside <DatePicker.RangeRoot>.`,
    );
  }

  // `isDateUnavailable` is not something the platform knows, so it is told: the input is then
  // :invalid, and a form will not submit.
  const { ref, validity } = slot;
  useEffect(() => {
    ref.current?.setCustomValidity(validity);
  }, [ref, validity]);

  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      type: context.withTime ? 'datetime-local' : 'date',
      value: slot.value,
      defaultValue: slot.defaultValue,
      min: slot.min,
      max: slot.max,
      disabled: context.disabled || undefined,
      'aria-label': slot.label,
      ref,
      onChange: slot.onChange,
    },
    consumerProps: rest as UnknownProps,
  });
}

/**
 * The date field: a native `<input type="date">`, or `datetime-local` with `withTime`. Every
 * native prop goes on it — `name`, `required`, `id`, a Field's attributes — and uncontrolled it
 * holds the value, so `register()` binds it as it binds any input.
 */
export function DatePickerInput(props: DatePickerInputProps) {
  return useDateInputPart('single', 'Input', props);
}

/** A range's first field. Named "Start date" unless labelled otherwise. */
export function DatePickerStartInput(props: DatePickerInputProps) {
  return useDateInputPart('start', 'StartInput', props);
}

/** A range's last field. Named "End date" unless labelled otherwise. */
export function DatePickerEndInput(props: DatePickerInputProps) {
  return useDateInputPart('end', 'EndInput', props);
}
