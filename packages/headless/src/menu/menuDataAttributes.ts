import type { MenuState } from './MenuRootContext';

/** The `data-*` attributes a menu emits, shared by Trigger and Popup — as Popover's. */
export function menuDataAttributes({ open }: MenuState) {
  return {
    'data-open': open ? '' : undefined,
    'data-closed': open ? undefined : '',
  };
}

/** On an Item. */
export function menuItemDataAttributes(disabled: boolean) {
  return { 'data-disabled': disabled ? '' : undefined };
}
