import type { Orientation } from '../core/rovingFocus';

/** On Root and List: the axis, for layout. */
export function orientationDataAttributes(orientation: Orientation) {
  return { 'data-orientation': orientation };
}

/**
 * On a Tab and its Panel. A mutually exclusive pair, as Switch's `checked` is, so both
 * sides are addressable at equal specificity.
 */
export function selectedDataAttributes(selected: boolean, disabled = false) {
  return {
    'data-selected': selected ? '' : undefined,
    'data-unselected': selected ? undefined : '',
    'data-disabled': disabled ? '' : undefined,
  };
}
