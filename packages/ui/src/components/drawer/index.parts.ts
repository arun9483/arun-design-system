import { Drawer as Headless } from '@arun-dev/headless/drawer';

// Root renders no element, and Trigger and Close are buttons the consumer styles — most
// often by rendering a Button: <Drawer.Close render={<Button />}>. They pass through.
export const Root = Headless.Root;
export const Trigger = Headless.Trigger;
export const Close = Headless.Close;
export { DrawerPopup as Popup } from './DrawerPopup';
export { DrawerTitle as Title } from './DrawerTitle';
