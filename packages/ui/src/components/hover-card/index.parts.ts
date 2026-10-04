import { HoverCard as Headless } from '@arun-dev/headless/hover-card';

// Root renders no element, and Trigger is a plain link the consumer styles — most often by
// rendering a Link: <HoverCard.Trigger render={<Link href="…" />}>. They pass through.
export const Root = Headless.Root;
export const Trigger = Headless.Trigger;
export { HoverCardPopup as Popup } from './HoverCardPopup';
