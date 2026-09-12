import { createContext, useContext } from 'react';

/** The state Switch.Root shares with its parts, and projects as `data-*` attributes. */
export type SwitchState = {
  checked: boolean;
  disabled: boolean;
};

export const SwitchRootContext = createContext<SwitchState | null>(null);

export function useSwitchRootContext(): SwitchState {
  const context = useContext(SwitchRootContext);

  if (context === null) {
    throw new Error('<Switch.Thumb> must be rendered inside <Switch.Root>.');
  }

  return context;
}
