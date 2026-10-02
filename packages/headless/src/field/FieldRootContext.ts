import { createContext, useContext } from 'react';

/** The state Field.Root shares with its parts, and projects as `data-*` attributes. */
export type FieldState = {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
};

export type FieldRootContextValue = FieldState & {
  /** The control's id: Label's `htmlFor`. */
  controlId: string;
  descriptionId: string;
  errorId: string;
  /** Whether a Description and an Error are rendered — what `aria-describedby` names. */
  hasDescription: boolean;
  hasError: boolean;
  registerDescription: () => () => void;
  registerError: () => () => void;
};

export const FieldRootContext = createContext<FieldRootContextValue | null>(null);

export function useFieldRootContext(part: string): FieldRootContextValue {
  const context = useContext(FieldRootContext);
  if (context === null) {
    throw new Error(`<Field.${part}> must be rendered inside <Field.Root>.`);
  }
  return context;
}

export function fieldDataAttributes({ invalid, disabled, required }: FieldState) {
  return {
    'data-invalid': invalid ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-required': required ? '' : undefined,
  };
}
