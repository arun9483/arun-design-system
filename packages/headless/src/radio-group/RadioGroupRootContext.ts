import { createContext, useContext } from 'react';

/**
 * The state RadioGroup.Root shares with its items.
 *
 * `value` is `null` when nothing is selected — a real state for a radio group, and the
 * one a native group starts in. `null` rather than `undefined`, because `undefined` is
 * what tells `useControlled` a group is uncontrolled.
 */
export type RadioGroupState = {
  value: string | null;
  disabled: boolean;
  required: boolean;
  /** Always set — the consumer's, or one generated so the radios still form a group. */
  name: string;
  form: string | undefined;
  /** The group's single setter. Every change goes through it (decision 10, rule 5). */
  select: (value: string) => void;
};

/** What one radio projects as `data-*` attributes. */
export type RadioGroupItemState = {
  checked: boolean;
  disabled: boolean;
};

export const RadioGroupRootContext = createContext<RadioGroupState | null>(null);

export function useRadioGroupRootContext(): RadioGroupState {
  const context = useContext(RadioGroupRootContext);

  if (context === null) {
    throw new Error('<RadioGroup.Item> must be rendered inside <RadioGroup.Root>.');
  }

  return context;
}
