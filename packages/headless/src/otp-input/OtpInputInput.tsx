import type {
  ChangeEvent,
  ClipboardEvent,
  ComponentPropsWithRef,
  CompositionEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { sanitize, useOtpInputRootContext } from './OtpInputRootContext';

type OtpInputInputOwnProps = {
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the `<input>`, so focus management and a form library's focus-on-error reach it. */
  ref?: Ref<HTMLElement>;
};

export type OtpInputInputProps = OtpInputInputOwnProps &
  Omit<
    ComponentPropsWithRef<'input'>,
    keyof OtpInputInputOwnProps | 'value' | 'defaultValue' | 'type' | 'disabled'
  >;

/**
 * The native `<input>` that holds the code: the element focus, typing, paste, autofill and
 * the form all use. `name`, `required`, `autoFocus`, `aria-*` and a Field's attributes go here.
 *
 * Draw it over the Slots, transparent: a press then lands on the input, so mobile paste menus
 * and autofill prompts work, and the Root maps the press to the slot under it.
 *
 * The caret always covers one character, so typing replaces the character in the active slot
 * and moves on, and the last slot of a full code is replaced rather than refused. Left and
 * Right move one slot; Backspace and Delete are the platform's.
 *
 * Carries `maxLength` and a `pattern` of exactly `length` allowed characters, so the browser's
 * own validation reports a code that is too short. Both can be overridden.
 */
export function OtpInputInput({ render, ...rest }: OtpInputInputProps) {
  const { value, length, disabled, validationType, setSelection, commit, inputRef, slotAt } =
    useOtpInputRootContext('Input');

  /**
   * Puts the caret on slot `index`: over its character, or before an empty slot. A code has
   * no gaps, so a slot past the end of the text means the end.
   */
  function select(input: HTMLInputElement, index: number) {
    const filled = input.value.length;
    const at = Math.max(0, Math.min(index, filled, length - 1));
    if (at < filled) input.setSelectionRange(at, at + 1);
    else input.setSelectionRange(filled, filled);
    // The platform reports a caret moved from script a task later, if at all.
    report(input);
  }

  function report(input: HTMLInputElement) {
    setSelection({ start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 });
  }

  /** Reads the caret the platform moved, widening a bare caret to the character after it. */
  function syncSelection(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    if (start === end && (start < input.value.length || start >= length)) select(input, start);
    else report(input);
  }

  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      ref: inputRef,
      type: 'text',
      value,
      inputMode: validationType === 'numeric' ? 'numeric' : 'text',
      autoComplete: 'one-time-code',
      autoCapitalize: 'off',
      autoCorrect: 'off',
      spellCheck: false,
      maxLength: length,
      pattern: validationType === 'numeric' ? `\\d{${length}}` : `[A-Za-z0-9]{${length}}`,
      disabled: disabled || undefined,
      onBeforeInput(event: CompositionEvent<HTMLInputElement>) {
        // A typed character that is not allowed would replace the one under the caret and
        // then be dropped, deleting that character. Refuse it before it lands. Longer text —
        // autofill — goes through and is cleaned in `commit`.
        const typed = event.data;
        if (typed && typed.length === 1 && !sanitize(typed, validationType)) {
          event.preventDefault();
        }
      },
      onChange(event: ChangeEvent<HTMLInputElement>) {
        commit(event.currentTarget.value);
        // Move on to the next slot now, not when the platform reports the caret later.
        syncSelection(event);
      },
      onPaste(event: ClipboardEvent<HTMLInputElement>) {
        const pasted = sanitize(event.clipboardData.getData('text/plain'), validationType);
        event.preventDefault();
        if (!pasted) return;
        const input = event.currentTarget;
        // A whole code replaces what is there; a fragment goes in at the caret. Handled here
        // because `maxLength` would cut "123 456" to "123 45" before it reached `onChange`.
        if (pasted.length >= length) {
          commit(pasted);
          return;
        }
        const start = input.selectionStart ?? value.length;
        const end = input.selectionEnd ?? start;
        commit(value.slice(0, start) + pasted + value.slice(end));
      },
      onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
        // The caret covers a character, so the platform's Left would only collapse it.
        const input = event.currentTarget;
        const at = input.selectionStart ?? 0;
        event.preventDefault();
        select(input, event.key === 'ArrowLeft' ? at - 1 : at + 1);
      },
      onClick(event: MouseEvent<HTMLInputElement>) {
        // A double click keeps the platform's select-all.
        if (event.detail > 1) return;
        const index = slotAt(event.clientX);
        if (index !== null) select(event.currentTarget, index);
      },
      onSelect: syncSelection,
      onFocus(event: SyntheticEvent<HTMLInputElement>) {
        // At the first empty slot, rather than the platform's select-all on Tab, which would
        // make the next key replace the whole code. A press then moves it to its slot.
        select(event.currentTarget, event.currentTarget.value.length);
      },
      onBlur() {
        setSelection(null);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
