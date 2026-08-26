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
    if (isControlled !== (controlled !== undefined)) {
      console.error(
        `${name}: cannot switch between controlled and uncontrolled \`${state}\`. ` +
          `Decide which one this component is for the whole of its life.`,
      );
    }
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
