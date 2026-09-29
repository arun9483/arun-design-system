import type { PopoverState } from './PopoverRootContext';

/** The `data-*` attributes a popover emits, shared by Trigger and Popup — as Dialog's. */
export function popoverDataAttributes({ open }: PopoverState) {
  return {
    'data-open': open ? '' : undefined,
    'data-closed': open ? undefined : '',
  };
}
