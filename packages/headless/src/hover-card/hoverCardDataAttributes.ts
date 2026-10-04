import type { HoverCardState } from './HoverCardRootContext';

/** The `data-*` attributes a hover card emits, shared by Trigger and Popup — as Tooltip's. */
export function hoverCardDataAttributes({ open }: HoverCardState) {
  return {
    'data-open': open ? '' : undefined,
    'data-closed': open ? undefined : '',
  };
}
