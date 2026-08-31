import {
  booleanAttribute,
  disabledAttribute,
  type StateAttributeMapping,
} from '../core/stateAttributes';
import type { SwitchState } from './SwitchRootContext';

/**
 * Shared by Root and Thumb so both carry the same attributes — the thumb needs them
 * to animate, and styling either part reads the same way.
 *
 * `checked` emits a mutually exclusive pair rather than one attribute, so both sides
 * are addressable at equal specificity:
 *
 *   .switch[data-unchecked] .thumb { transform: translateX(0); }
 *   .switch[data-checked]   .thumb { transform: translateX(100%); }
 */
export const switchStateAttributes: StateAttributeMapping<SwitchState> = {
  checked: booleanAttribute('data-checked', 'data-unchecked'),
  disabled: disabledAttribute,
};
