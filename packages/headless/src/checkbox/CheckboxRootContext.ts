import { createContext, useContext } from 'react';

/**
 * A checkbox has three states, not two.
 *
 * `'indeterminate'` is a state of the checkbox itself, not a separate flag beside
 * `checked` — a single union makes `checked && indeterminate` unrepresentable, and
 * keeps one source of state to derive everything else from (decision 10).
 *
 * Native HTML splits them, but only because `.indeterminate` is a DOM property with no
 * attribute behind it: it is purely visual there, is cleared by the first click, and
 * survives `form.reset()`. None of that is worth reproducing.
 */
export type CheckedState = boolean | 'indeterminate';

/** The state Checkbox.Root shares with its parts, and projects as `data-*` attributes. */
export type CheckboxState = {
  checked: CheckedState;
  disabled: boolean;
};

export const CheckboxRootContext = createContext<CheckboxState | null>(null);

export function useCheckboxRootContext(): CheckboxState {
  const context = useContext(CheckboxRootContext);

  if (context === null) {
    throw new Error('<Checkbox.Indicator> must be rendered inside <Checkbox.Root>.');
  }

  return context;
}
