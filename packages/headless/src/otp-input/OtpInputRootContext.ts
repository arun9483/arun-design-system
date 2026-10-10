'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/** The characters a code may hold: digits only, or letters and digits. */
export type OtpInputValidationType = 'numeric' | 'alphanumeric';

/** The caret, as the input reports it: one slot, or a run of them when text is selected. */
export type OtpInputSelection = { start: number; end: number };

/** The state OtpInput.Root shares with its parts, and projects as `data-*` attributes. */
export type OtpInputState = {
  value: string;
  length: number;
  disabled: boolean;
};

export type OtpInputRootContextValue = OtpInputState & {
  validationType: OtpInputValidationType;
  /** Where the caret is while the input has focus; `null` while it does not. */
  selection: OtpInputSelection | null;
  setSelection: (selection: OtpInputSelection | null) => void;
  /** The single setter: typing, pasting, autofill and form reset all go through it. */
  commit: (next: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Slots register their element so a press can find the slot under the pointer. */
  registerSlot: (index: number, element: HTMLElement | null) => void;
  slotAt: (clientX: number) => number | null;
};

export const OtpInputRootContext = createContext<OtpInputRootContextValue | null>(null);

export function useOtpInputRootContext(part: string): OtpInputRootContextValue {
  const context = useContext(OtpInputRootContext);
  if (context === null) {
    throw new Error(`<OtpInput.${part}> must be rendered inside <OtpInput.Root>.`);
  }
  return context;
}

/**
 * A box emptied in place: Delete or Backspace on a character before the end leaves a space,
 * so the characters after it keep their boxes. The `pattern` rejects it, so a code with a gap
 * is invalid until the box is filled again.
 */
export const GAP = ' ';

/** Keeps only the characters `validationType` allows, so pasted "123 456" becomes "123456". */
export function sanitize(text: string, validationType: OtpInputValidationType): string {
  return validationType === 'numeric' ? text.replace(/\D/g, '') : text.replace(/[^A-Za-z0-9]/g, '');
}

/**
 * What the Root stores: allowed characters and gaps, at most `length`, with no gap at the end —
 * an empty last box is simply a shorter code.
 */
export function normalize(text: string, validationType: OtpInputValidationType, length: number) {
  const allowed = validationType === 'numeric' ? /[^\d ]/g : /[^A-Za-z0-9 ]/g;
  return text.replace(allowed, '').slice(0, length).trimEnd();
}

/** Every box holds a character: `length` of them, and no gap. */
export function isComplete(value: string, length: number): boolean {
  return value.length === length && !value.includes(GAP);
}

export function otpInputDataAttributes({ value, length, disabled }: OtpInputState) {
  return {
    'data-complete': isComplete(value, length) ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  };
}
