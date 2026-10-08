import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useControlled } from '../core/useControlled';
import { afterReset, useLatest } from '../core/useLatest';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  OtpInputRootContext,
  isComplete,
  normalize,
  otpInputDataAttributes,
  type OtpInputSelection,
  type OtpInputValidationType,
} from './OtpInputRootContext';

type OtpInputRootOwnProps = {
  /**
   * Controlled value. Provide `onValueChange` alongside it.
   *
   * Never `undefined` once mounted: the mode is latched at mount. Coalesce at the call site —
   * `value={code ?? ''}`.
   */
  value?: string;
  /** Initial value when uncontrolled. Read once, at mount. */
  defaultValue?: string;
  /**
   * Called with the code after every change, partial or complete. A box emptied before the end
   * is a space — `"123 56"` — so check completeness with a pattern such as `/^\d{6}$/`, not
   * the length alone.
   */
  onValueChange?: (value: string) => void;
  /**
   * Called with the code after a change that leaves it complete: every slot filled, no gap.
   * Typing the last digit, pasting a whole code and filling an emptied slot all count; a change
   * that leaves a slot empty does not. Use it to verify as soon as the code is in.
   */
  onComplete?: (value: string) => void;
  /** How many characters the code has, and so how many slots it shows. Defaults to 6. */
  length?: number;
  /**
   * Which characters are kept: `numeric` (the default) keeps digits, `alphanumeric` letters and
   * digits. Anything else typed or pasted is dropped.
   */
  validationType?: OtpInputValidationType;
  /** Disables the input, and marks the Root and every Slot `data-disabled`. */
  disabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type OtpInputRootProps = OtpInputRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof OtpInputRootOwnProps | 'defaultValue'>;

/**
 * A one-time code: a single native `<input>` that holds the whole code, with one Slot per
 * character drawn beside it (decision 20).
 *
 * One real input rather than one per character, because a text field cannot leave the native
 * element (decision 7): SMS autofill (`autocomplete="one-time-code"`), paste, the numeric
 * keypad, IME and password managers all target one input. The Slots are pictures of it.
 *
 * Holds the value through `useControlled`. The input reports changes, and the Root keeps only
 * the characters `validationType` allows, up to `length`.
 */
export function OtpInputRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  onComplete,
  length = 6,
  validationType = 'numeric',
  disabled = false,
  className,
  children,
  render,
  ...rest
}: OtpInputRootProps) {
  const [value, setValue] = useControlled<string>({
    controlled: valueProp,
    default: defaultValue ?? '',
    name: 'OtpInput.Root',
    state: 'value',
  });

  // Every change goes through here, so the value is always clean and never longer than
  // `length`, whatever the input or a parent hands it. Gaps — boxes emptied in place — stay.
  const commit = useCallback(
    (next: string) => {
      const clean = normalize(next, validationType, length);
      if (clean === value) return;
      setValue(clean);
      onValueChange?.(clean);
      if (isComplete(clean, length)) onComplete?.(clean);
    },
    [validationType, length, value, setValue, onValueChange, onComplete],
  );

  const [selection, setSelection] = useState<OtpInputSelection | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const slotsRef = useRef(new Map<number, HTMLElement>());

  const registerSlot = useCallback((index: number, element: HTMLElement | null) => {
    if (element) slotsRef.current.set(index, element);
    else slotsRef.current.delete(index);
  }, []);

  // The slot under the pointer, or the nearest one: geometry the pointer pressed on, read at
  // the press, never state (decision 10).
  const slotAt = useCallback((clientX: number) => {
    let nearest: number | null = null;
    let distance = Infinity;
    for (const [index, element] of slotsRef.current) {
      const rect = element.getBoundingClientRect();
      const d =
        clientX < rect.left ? rect.left - clientX : clientX > rect.right ? clientX - rect.right : 0;
      if (d < distance) {
        distance = d;
        nearest = index;
      }
    }
    return nearest;
  }, []);

  // `form.reset()` restores the input's default, which React keeps equal to the current value,
  // so the reset would change nothing. Return to the mount-time value instead, through the
  // same setter typing uses — a native input would go back to its default.
  const [initialValue] = useState(value);
  const latest = useLatest(commit);
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    function onReset(event: Event) {
      // Once the reset has settled, through the setter on screen then (see `afterReset`):
      // it compares with the current value, so a reset a form library made is not repeated.
      afterReset(event, () => latest.current(initialValue));
    }
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [latest, initialValue]);

  const context = useMemo(
    () => ({
      value,
      length,
      disabled,
      validationType,
      selection,
      setSelection,
      commit,
      inputRef,
      registerSlot,
      slotAt,
    }),
    [value, length, disabled, validationType, selection, commit, registerSlot, slotAt],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...otpInputDataAttributes({ value, length, disabled }),
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });

  return <OtpInputRootContext.Provider value={context}>{element}</OtpInputRootContext.Provider>;
}
