import type { SwitchState } from './SwitchRootContext';

/**
 * The `data-*` attributes a switch emits, shared by Root and Thumb so both carry the
 * same set — the thumb needs them to animate, and styling either part reads the same way.
 *
 * `checked` emits a mutually exclusive pair rather than one attribute, so both sides
 * are addressable at equal specificity, and a third state stays addable without
 * `:not([data-checked])` silently absorbing it:
 *
 *   .switch[data-unchecked] .thumb { transform: translateX(0); }
 *   .switch[data-checked]   .thumb { transform: translateX(100%); }
 *
 * React drops an attribute whose value is `undefined`, so the absent cases need no
 * filtering of their own.
 */
export function switchDataAttributes({ checked, disabled }: SwitchState) {
  return {
    'data-checked': checked ? '' : undefined,
    'data-unchecked': checked ? undefined : '',
    'data-disabled': disabled ? '' : undefined,
  };
}
