import type { CheckboxState } from './CheckboxRootContext';

/**
 * The `data-*` attributes a checkbox emits, shared by Root and Indicator so both carry
 * the same set — the indicator needs them to swap its glyph, and styling either part
 * reads the same way.
 *
 * The three checked states are three mutually exclusive attributes rather than one
 * attribute with a value, so all three are addressable at equal specificity:
 *
 *   .checkbox[data-unchecked]     .check { opacity: 0; }
 *   .checkbox[data-checked]       .check { opacity: 1; }
 *   .checkbox[data-indeterminate] .dash  { opacity: 1; }
 *
 * This is the shape `data-unchecked` was introduced for on Switch: `:not([data-checked])`
 * would have absorbed the indeterminate case silently, and this is the component that
 * proves it.
 *
 * React drops an attribute whose value is `undefined`, so the absent cases need no
 * filtering of their own.
 */
export function checkboxDataAttributes({ checked, disabled }: CheckboxState) {
  return {
    'data-checked': checked === true ? '' : undefined,
    'data-unchecked': checked === false ? '' : undefined,
    'data-indeterminate': checked === 'indeterminate' ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  };
}
