import { createContext, useContext } from 'react';

export type ToggleGroupContextValue = {
  value: readonly string[];
  disabled: boolean;
  toggle: (value: string) => void;
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext(): ToggleGroupContextValue | null {
  return useContext(ToggleGroupContext);
}
