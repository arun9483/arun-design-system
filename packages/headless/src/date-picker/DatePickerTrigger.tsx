import type { ComponentPropsWithRef } from 'react';
import { PopoverTrigger } from '../popover/PopoverTrigger';
import type { PopoverTriggerProps } from '../popover/PopoverTrigger';
import { useDatePickerRootContext } from './DatePickerRootContext';

export type DatePickerTriggerProps = PopoverTriggerProps & ComponentPropsWithRef<'button'>;

/**
 * The button that opens the Popup: a Popover trigger, named "Choose date" and then the date
 * chosen, so a screen reader hears it. Put a calendar icon in it.
 */
export function DatePickerTrigger(props: DatePickerTriggerProps) {
  const { triggerLabel, disabled } = useDatePickerRootContext('Trigger');
  return <PopoverTrigger aria-label={triggerLabel} disabled={disabled || undefined} {...props} />;
}
