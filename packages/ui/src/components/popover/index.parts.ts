import { Popover as Headless } from '@arun-dev/headless/popover';

// Root renders no element, and Trigger and Close are buttons the consumer styles — most
// often by rendering a Button: <Popover.Trigger render={<Button />}>. They pass through.
export const Root = Headless.Root;
export const Trigger = Headless.Trigger;
export const Close = Headless.Close;
export { PopoverPopup as Popup } from './PopoverPopup';
