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

/**
 * Turns a state object into the `data-*` attributes a mapping declares for it.
 *
 * Walks the state's own keys, so a field the mapping does not cover contributes
 * nothing, and a mapping entry that returns `null` is skipped. Entries may each
 * emit several attributes; later keys win if two entries name the same attribute.
 *
 * @param state - The component's current state.
 * @param mapping - Which fields become attributes. `undefined` yields `{}`.
 * @returns The attributes to spread onto the element.
 */
export function getStateAttributes<State extends Record<string, unknown>>(
  state: State,
  mapping: StateAttributeMapping<State> | undefined,
): UnknownProps {
  if (!mapping) return {};

  const attributes: UnknownProps = {};

  for (const key of Object.keys(state) as (keyof State)[]) {
    // mapping function declared for this state key is looked-up from mapping object and stored
    // in toAttributes, e.g. `checked` -> booleanAttribute(...).
    const toAttributes = mapping[key];
    // no mapping function found for this state key, so the key is skipped and contributes
    // nothing to attributes — every key in a mapping is optional.
    if (!toAttributes) continue;

    // mapping function is executed with the current value of this state key and its return is
    // stored in result, e.g. true -> { 'data-checked': '' }.
    const result = toAttributes(state[key]);
    // result is merged into attributes when the value emitted something, and dropped when the
    // mapping function returned null, e.g. disabledAttribute(false) -> null.
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
