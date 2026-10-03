import { useEffect, useLayoutEffect, useRef } from 'react';
import type {
  ChangeEvent,
  ClipboardEvent,
  ComponentPropsWithRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { GAP, sanitize, useOtpInputRootContext } from './OtpInputRootContext';

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
 * Right move one slot.
 *
 * Delete and Backspace empty a slot in place: the characters after it keep their slots, and
 * the caret stays, so the next character fills the same slot. Backspace on an empty slot
 * empties the one before it; Delete on an empty slot does nothing.
 *
 * Carries `maxLength` and a `pattern` of exactly `length` allowed characters, so the browser's
 * own validation reports a code that is too short. Both can be overridden.
 */
export function OtpInputInput({ render, ...rest }: OtpInputInputProps) {
  const { value, length, disabled, validationType, setSelection, commit, inputRef, slotAt } =
    useOtpInputRootContext('Input');

  /**
   * Puts the caret on slot `index`: over its character or gap, or before an empty slot. The
   * code ends at its last character, so a slot past it means the end.
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

  // Where the caret goes once an edit made here has rendered: setting the value moves the
  // platform's caret to the end.
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const input = inputRef.current;
    const at = pendingCaret.current;
    pendingCaret.current = null;
    if (input && at !== null && input.ownerDocument.activeElement === input) select(input, at);
  });

  /** Commits an edit made here, and keeps the caret on slot `caret` after it renders. */
  function edit(next: string, caret: number) {
    pendingCaret.current = caret;
    commit(next);
  }

  /** Empties slot `index` in place. */
  const cleared = (index: number) => value.slice(0, index) + GAP + value.slice(index + 1);

  /**
   * Deletion, from `beforeinput` rather than `keydown`: a phone keyboard often sends no
   * Backspace key at all, but every deletion is announced here, and can be refused.
   */
  function onDelete(event: InputEvent, input: HTMLInputElement) {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    event.preventDefault();
    if (end > start + 1) {
      // A run of slots — Shift+arrows, or select-all — empties every one of them.
      edit(value.slice(0, start) + GAP.repeat(end - start) + value.slice(end), start);
    } else if (end === start + 1 && value.charAt(start) !== GAP) {
      edit(cleared(start), start);
    } else if (event.inputType.includes('Backward') && start > 0) {
      // On an empty slot, or after the last character: Backspace moves back and empties.
      edit(cleared(start - 1), start - 1);
    }
  }

  // The platform's `beforeinput`: React's `onBeforeInput` is a different event that never
  // reports a deletion. The handler is read through a ref so the listener sees this render.
  const beforeInput = useRef<(event: InputEvent) => void>(() => {});
  beforeInput.current = (event: InputEvent) => {
    const input = event.currentTarget as HTMLInputElement;
    if (event.inputType.startsWith('delete') && event.inputType !== 'deleteByCut') {
      onDelete(event, input);
    } else if (event.inputType === 'insertText') {
      // A typed character that is not allowed would replace the one under the caret and then
      // be dropped. Refuse it before it lands. Autofill and paste are cleaned in `commit`.
      const typed = event.data ?? '';
      if (typed.length > 0 && sanitize(typed, validationType) !== typed) event.preventDefault();
    }
  };
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const listener = (event: Event) => beforeInput.current(event as InputEvent);
    input.addEventListener('beforeinput', listener);
    return () => input.removeEventListener('beforeinput', listener);
  }, [inputRef]);

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
        // A whole code replaces what is there. A fragment fills slots from the caret on, over
        // what they held, as typing does; slots of a longer selection it does not reach are
        // emptied. Handled here because `maxLength` would cut "123 456" to "123 45" first.
        if (pasted.length >= length) {
          edit(pasted, length);
          return;
        }
        const start = input.selectionStart ?? value.length;
        const end = input.selectionEnd ?? start;
        const reach = start + pasted.length;
        edit(
          value.slice(0, start) +
            pasted +
            GAP.repeat(Math.max(0, end - reach)) +
            value.slice(Math.max(end, reach)),
          reach,
        );
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
        const index = slotAt(event.clientX);
        if (index !== null) select(event.currentTarget, index);
      },
      onSelect: syncSelection,
      onFocus(event: SyntheticEvent<HTMLInputElement>) {
        // At the first empty slot — a gap, or the end — rather than the platform's select-all
        // on Tab, which would make the next key replace the whole code. A press then moves it.
        const gap = value.indexOf(GAP);
        select(event.currentTarget, gap === -1 ? value.length : gap);
      },
      onBlur() {
        setSelection(null);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
