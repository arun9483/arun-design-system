import type { TooltipState } from './TooltipRootContext';

/** The `data-*` attributes a tooltip emits, shared by Trigger and Popup — as Popover's. */
export function tooltipDataAttributes({ open }: TooltipState) {
  return {
    'data-open': open ? '' : undefined,
    'data-closed': open ? undefined : '',
  };
}
