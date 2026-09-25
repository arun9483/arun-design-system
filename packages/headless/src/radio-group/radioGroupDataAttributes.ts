import type { RadioGroupItemState, RadioGroupState } from './RadioGroupRootContext';

/**
 * The `data-*` attributes a radio emits. The same three-attribute shape as Checkbox and
 * Switch — `data-checked` / `data-unchecked` rather than one attribute with a value — so
 * a stylesheet reads every control the same way.
 *
 * Emitted on the native `<input>` alongside `:checked` rather than instead of it. The
 * pseudo-class tracks the DOM; these track the component's state, which is what decision
 * 10 says everything derives from, and which a `render` override cannot move.
 *
 * React drops an attribute whose value is `undefined`, so the absent cases need no
 * filtering of their own.
 */
export function radioGroupItemDataAttributes({ checked, disabled }: RadioGroupItemState) {
  return {
    'data-checked': checked ? '' : undefined,
    'data-unchecked': checked ? undefined : '',
    'data-disabled': disabled ? '' : undefined,
  };
}

/** The group carries only what is true of the group as a whole. */
export function radioGroupDataAttributes({ disabled }: Pick<RadioGroupState, 'disabled'>) {
  return {
    'data-disabled': disabled ? '' : undefined,
  };
}
