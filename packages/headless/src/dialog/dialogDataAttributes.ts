import type { DialogState } from './DialogRootContext';

/**
 * The `data-*` attributes a dialog emits, shared by Trigger and Popup. A mutually
 * exclusive pair rather than one attribute, as Switch does, so both sides are addressable
 * at equal specificity:
 *
 *   .dialog[data-open]   { … }
 *   .trigger[data-closed] { … }
 */
export function dialogDataAttributes({ open }: DialogState) {
  return {
    'data-open': open ? '' : undefined,
    'data-closed': open ? undefined : '',
  };
}
