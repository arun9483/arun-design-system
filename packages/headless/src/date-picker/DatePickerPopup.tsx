import { PopoverPopup, type PopoverPopupProps } from '../popover/PopoverPopup';
import { useDatePickerRootContext } from './DatePickerRootContext';

export type DatePickerPopupProps = PopoverPopupProps;

/**
 * The popup holding the Calendar: a Popover popup (decision 12), named "Choose date". A
 * Calendar.Root or Calendar.RangeRoot inside it picks for the picker, takes focus when it
 * opens, and closes it once a date or a range is picked.
 */
export function DatePickerPopup(props: DatePickerPopupProps) {
  const { labels } = useDatePickerRootContext('Popup');
  return <PopoverPopup aria-label={labels.dialog} {...props} />;
}
