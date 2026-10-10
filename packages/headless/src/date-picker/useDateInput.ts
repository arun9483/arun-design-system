'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { afterReset, useLatest } from '../core/useLatest';
import { datePart, toInputValue } from '../calendar/dates';
import type { DateInputSlot } from './DatePickerRootContext';

/** A bound for a native input: a date, or with `withTime` the start or end of that day. */
export function inputBound(
  value: string | undefined,
  withTime: boolean,
  edge: 'start' | 'end',
): string | undefined {
  if (!value) return undefined;
  if (withTime && value.length === 10) return `${value}T${edge === 'start' ? '00:00' : '23:59'}`;
  return toInputValue(value, withTime) ?? undefined;
}

/**
 * One native date input, run as Input is (decision 27). Uncontrolled, the input holds the value,
 * so react-hook-form's `register()` reads and writes it; the Root keeps a copy from the input's
 * own events, and reads the input when the picker opens and after `form.reset()`, the moments
 * something may have set it without an event. Controlled, React sets it from `value`.
 */
export function useDateInput({
  value,
  defaultValue,
  withTime,
  onValueChange,
}: {
  value: string | null | undefined;
  defaultValue: string | null | undefined;
  withTime: boolean;
  onValueChange: (value: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  // Latched at mount, as useControlled does.
  const [controlled] = useState(value !== undefined);
  const [current, setCurrent] = useState(() => toInputValue(defaultValue, withTime));
  const [initial] = useState(() => toInputValue(defaultValue, withTime) ?? undefined);
  const shown = controlled ? toInputValue(value, withTime) : current;

  // While the Root writes several inputs at once, it reports the result itself, once.
  const quiet = useRef(false);
  const report = useLatest(onValueChange);
  const shownRef = useLatest(shown);

  const read = () => toInputValue(ref.current?.value, withTime);

  /** Takes up what the input holds now: when the picker opens. */
  const sync = () => {
    if (!controlled) setCurrent(read());
  };

  /** Sets the value: through the input, so its listeners — a form library's — hear it. */
  // Stable: it reads only refs and the mode latched at mount, so a Root can depend on it.
  const write = useCallback(
    (next: string | null, silently = false) => {
      if (controlled) {
        if (!silently) report.current(next);
        return;
      }
      const input = ref.current;
      if (!input) return;
      quiet.current = silently;
      // React tracks the value it last set; the prototype's setter goes around it, so the
      // `input` event reaches onChange like a typed change.
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        input,
        next ?? '',
      );
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      quiet.current = false;
    },
    [controlled, report],
  );

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value || null;
    if (!controlled) setCurrent(next);
    if (!quiet.current) report.current(next);
  };

  // The platform resets the input; the copy follows, and the change is reported.
  useEffect(() => {
    const form = ref.current?.form;
    if (!form || controlled) return;
    const onReset = (event: Event) =>
      afterReset(event, () => {
        const next = read();
        if (next === shownRef.current) return;
        setCurrent(next);
        report.current(next);
      });
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  });

  const slot = (extra: {
    min: string | undefined;
    max: string | undefined;
    unavailable: ((date: string) => boolean) | undefined;
    unavailableMessage: string;
    label: string | undefined;
  }): DateInputSlot => {
    const day = datePart(shown);
    return {
      ref,
      value: controlled ? (shown ?? '') : undefined,
      defaultValue: controlled ? undefined : initial,
      min: extra.min,
      max: extra.max,
      validity: day && extra.unavailable?.(day) ? extra.unavailableMessage : '',
      onChange,
      label: extra.label,
    };
  };

  return { shown, sync, write, slot };
}
