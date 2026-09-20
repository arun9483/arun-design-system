import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Returns a control to the state it mounted with when its form is reset.
 *
 * Every component here that participates in a form does so the same way: a custom
 * element carrying the state, and a hidden native input carrying the form value
 * (decision 7 — the custom element fails the content test, the input is kept for what
 * the platform still does well). The platform resets that hidden input by itself, but
 * knows nothing of the React state behind `aria-checked` and the `data-*` attributes —
 * without this, a reset form shows one value and submits another.
 *
 * React writes the mount-time value as the input's default, so "the state it mounted
 * with" is exactly what the platform resets the input to.
 *
 * `reset` fires before the form resets, and a listener that runs after this one can
 * still cancel it, so the work waits for a microtask, when dispatch has finished.
 *
 * `inputChecked` is the already-derived boolean rather than a `value => boolean`
 * function on purpose: a function would be a new identity every render and re-subscribe
 * the effect each time, and the caller derives it for the input's own `checked` anyway.
 */
export function useFormReset<T>({
  elementRef,
  inputRef,
  value,
  inputChecked,
  commit,
}: {
  /** The rendered element, used to find the enclosing form. */
  elementRef: RefObject<HTMLElement | null>;
  /** The hidden input carrying the form value. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** The component's state. Restored to its mount-time value on reset. */
  value: T;
  /** What the hidden input's `checked` should be for the current `value`. */
  inputChecked: boolean;
  /** The component's single setter — the same one a click goes through. */
  commit: (next: T) => void;
}): void {
  const { current: initialValue } = useRef(value);

  useEffect(() => {
    // `.form` also honours a `form="id"` attribute on the element.
    const form = (elementRef.current as HTMLButtonElement | null)?.form;
    if (!form) return;

    function onReset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        // Undo the platform's reset of the input: it follows the component, and only
        // moves when the state below does — which a controlled parent may decline.
        if (inputRef.current) inputRef.current.checked = inputChecked;
        if (value === initialValue) return;
        commit(initialValue);
      });
    }

    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [elementRef, inputRef, value, inputChecked, commit, initialValue]);
}
