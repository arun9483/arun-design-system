import { createContext, useContext } from 'react';

/**
 * A type alias rather than an interface: only aliases get an implicit index
 * signature, which is what lets this satisfy the `Record<string, unknown>` the
 * state-attribute mapper is generic over.
 */
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
