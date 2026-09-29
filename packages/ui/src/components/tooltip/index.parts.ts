import { Tooltip as Headless } from '@arun-dev/headless/tooltip';

// Root renders no element, and the Trigger is whatever it describes — most often a Button,
// rendered through it: <Tooltip.Trigger render={<Button />}>. They pass through.
export const Root = Headless.Root;
export const Trigger = Headless.Trigger;
export { TooltipPopup as Popup } from './TooltipPopup';
