import { PopoverClose, type PopoverCloseProps } from '../popover/PopoverClose';

export type DatePickerCloseProps = PopoverCloseProps;

/**
 * Closes the Popup, returning focus to the Trigger: a "Done" button, which a Popup with a time
 * needs, since a pick no longer closes it. Esc and a click outside close it too.
 */
export function DatePickerClose(props: DatePickerCloseProps) {
  return <PopoverClose {...props} />;
}
