import { Combobox as Headless } from '@arun-dev/headless/combobox';

// Root renders no element of its own beyond hidden form inputs, and holds the state: it
// passes through. Input is the whole styled field — chips, text, Clear and chevron.
export const Root = Headless.Root;
export { ComboboxInput as Input } from './ComboboxInput';
export { ComboboxPopup as Popup } from './ComboboxPopup';
export { ComboboxList as List } from './ComboboxList';
export { ComboboxItem as Item } from './ComboboxItem';
export { ComboboxGroup as Group, ComboboxGroupLabel as GroupLabel } from './ComboboxGroup';
export { ComboboxEmpty as Empty, ComboboxStatus as Status } from './ComboboxMessage';
