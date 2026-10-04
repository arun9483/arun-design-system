import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * A ref that always holds the latest committed `value`, for code that runs later than the
 * render that scheduled it — a form's `reset` listener, which must see the state and the
 * setter of the render on screen when it runs, not of the render that subscribed it.
 *
 * Internal (decision 9).
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Runs `work` once a `reset` event has finished and the page has settled, unless a listener
 * cancelled it.
 *
 * `reset` fires before the form resets, and a later listener can still cancel it. A task
 * rather than a microtask: a form library that resets its own state and then calls
 * `form.reset()` — react-hook-form's `reset()` does — has its re-render queued as a
 * microtask after this listener ran, and `work` must see that render, or it reports a change
 * the library already made, through a handler that still holds the old value.
 */
export function afterReset(event: Event, work: () => void): void {
  setTimeout(() => {
    if (!event.defaultPrevented) work();
  }, 0);
}
