import type { ComboboxState } from './ComboboxRootContext';

/** The `data-*` attributes shared by Input, Trigger and Popup. */
export function comboboxDataAttributes({ open, disabled }: ComboboxState) {
  return {
    'data-open': open ? '' : undefined,
    'data-closed': open ? undefined : '',
    'data-disabled': disabled ? '' : undefined,
  };
}

/** On an Item. */
export function comboboxItemDataAttributes({
  selected,
  highlighted,
  disabled,
}: {
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
}) {
  return {
    'data-selected': selected ? '' : undefined,
    'data-highlighted': highlighted ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  };
}

/** On Clear: present while there is a selection to clear. */
export function comboboxClearDataAttributes(visible: boolean) {
  return { 'data-visible': visible ? '' : undefined };
}
