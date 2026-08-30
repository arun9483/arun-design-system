import type { UnknownProps } from './mergeProps';

/**
 * Projects a component's state onto the DOM as `data-*` attributes.
 *
 * This is the contract between behaviour and styling. A headless component owns no
 * class names, so the only way CSS can react to `checked` or `disabled` is for the
 * state to be visible in the DOM:
 *
 *   .switch[data-checked] { background: var(--switch-track-bg-checked); }
 *
 * Doing it through a declared mapping rather than by hand keeps the attributes
 * consistent across components — Base UI's Checkbox emits eleven of them, which is
 * not something anyone maintains by hand — and makes the state a component exposes
 * a single readable object rather than scattered JSX.
 */

/**
 * Maps one state value to the attributes it should produce. Return `null` for
 * "no attribute". A single value may produce several, and mutually exclusive
 * attributes are how a third state stays addressable: with only `data-checked`,
 * `:not([data-checked])` would match both unchecked *and* indeterminate.
 */
export type StateAttributeMapping<State> = {
  [Key in keyof State]?: (value: State[Key]) => Record<string, string> | null;
};

export function getStateAttributes<State extends Record<string, unknown>>(
  state: State,
  mapping: StateAttributeMapping<State> | undefined,
): UnknownProps {
  if (!mapping) return {};

  const attributes: UnknownProps = {};

  for (const key of Object.keys(state) as (keyof State)[]) {
    const toAttributes = mapping[key];
    if (!toAttributes) continue;

    const result = toAttributes(state[key]);
    if (result) Object.assign(attributes, result);
  }

  return attributes;
}

/**
 * The common case: a boolean that emits one attribute when true and another when
 * false, so both sides are addressable at equal specificity.
 *
 *   checked: booleanAttribute('data-checked', 'data-unchecked')
 */
export function booleanAttribute(whenTrue: string, whenFalse?: string) {
  return (value: unknown): Record<string, string> | null => {
    if (value) return { [whenTrue]: '' };
    return whenFalse ? { [whenFalse]: '' } : null;
  };
}

/**
 * The shared spelling of the disabled state. Every component uses this rather than
 * writing the string again, so `[data-disabled]` means the same thing system-wide and
 * a typo cannot silently split the CSS contract.
 */
export const disabledAttribute = booleanAttribute('data-disabled');
