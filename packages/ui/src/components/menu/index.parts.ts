import { Menu as Headless } from '@arun-dev/headless/menu';

// Root renders no element, and Trigger is a button the consumer styles — most often by
// rendering a Button: <Menu.Trigger render={<Button />}>. They pass through.
export const Root = Headless.Root;
export const Trigger = Headless.Trigger;
export { MenuPopup as Popup } from './MenuPopup';
export { MenuItem as Item } from './MenuItem';
