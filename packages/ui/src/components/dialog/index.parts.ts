import { Dialog as Headless } from '@arun-dev/headless/dialog';

// Root renders no element, and Trigger and Close are buttons the consumer styles — most
// often by rendering a Button: <Dialog.Close render={<Button />}>. They pass through.
export const Root = Headless.Root;
export const Trigger = Headless.Trigger;
export const Close = Headless.Close;
export { DialogPopup as Popup } from './DialogPopup';
export { DialogTitle as Title } from './DialogTitle';
