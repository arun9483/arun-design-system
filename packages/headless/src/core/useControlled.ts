import { useCallback, useRef, useState } from 'react';

/**
 * Supports both controlled and uncontrolled use of a single value.
 *
 * The mode is decided once, at mount, and never re-evaluated. Recomputing it per
 * render would let a parent that briefly passes `undefined` flip the component to
 * uncontrolled and hand it stale internal state — a bug that is very hard to see.
 *
 * In controlled mode the setter deliberately does not write state: the parent owns
 * the value. Callers still fire their `onChange` in both modes, so the component
 * notifies either way.
 */
export function useControlled<T>({
  controlled,
  default: defaultValue,
  name = 'Component',
  state = 'value',
}: {
  controlled: T | undefined;
  default: T;
  name?: string;
  state?: string;
}): [T, (next: T) => void] {
  // Captured at mount on purpose — see above.
  const { current: isControlled } = useRef(controlled !== undefined);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const defaultRef = useRef(defaultValue);

  const value = isControlled ? (controlled as T) : uncontrolled;

  if (process.env.NODE_ENV !== 'production') {
    // mode captured at mount is compared against the mode this render's `controlled` implies,
    // so this is true only when the parent switched sides, e.g. mounted with `checked={x}` and
    // now passing undefined, or mounted without it and now passing a value.
    if (isControlled !== (controlled !== undefined)) {
      console.error(
        `${name}: cannot switch between controlled and uncontrolled \`${state}\`. ` +
          `Decide which one this component is for the whole of its life.`,
      );
    }
    // in uncontrolled mode the default captured at mount is compared against this render's
    // `default`, so this is true only when the parent changed it after mount, e.g.
    // defaultChecked={false} then defaultChecked={true} — useState already ignored the new one.
    if (!isControlled && defaultRef.current !== defaultValue) {
      console.error(
        `${name}: cannot change the default \`${state}\` after mount. ` +
          `It is only read once, so later changes are silently ignored.`,
      );
    }
  }

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
    },
    [isControlled],
  );

  return [value, setValue];
}
